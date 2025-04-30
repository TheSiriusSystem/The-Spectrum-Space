document.addEventListener("DOMContentLoaded", function()
{
    const form = document.getElementById("join-form");
    const formSteps = Array.from(document.querySelectorAll("#join .form-step"));
    const previousButtons = document.querySelectorAll("#join .previous-step-button");
    const nextButtons = document.querySelectorAll("#join .next-step-button");
    const controllingCheckboxes = document.querySelectorAll("#join .controls-dynamic-content");
    const dynamicContentSections = document.querySelectorAll("#join .dynamic-content-section");
    const progressSteps = document.querySelectorAll("#join .progress-step");
    const progressLine = document.querySelector("#join .progress-line");
    const transitionDelay = 500;

    let currentStepId = formSteps[0].id;
    let isTransitioning = false;

    function updateProgressIndicator(stepId)
    {
        const stepIndex = formSteps.findIndex(step => step.id === stepId);

        progressSteps.forEach(function(step, index)
        {
            if (index < stepIndex)
            {
                step.classList.remove('is-active');
                step.classList.add('is-completed');
            } else if (index === stepIndex)
            {
                step.classList.add('is-active');
                step.classList.remove('is-completed');
            } else
            {
                step.classList.remove('is-active', 'is-completed');
            }
        });

        if (progressLine)
        {
            const percentage = stepIndex === 0 ? 0 : (stepIndex / (formSteps.length - 1)) * 100.0;
            progressLine.style.width = `${percentage}%`;
        }
    }

    function updateDynamicContentDisplay()
    {
        /*dynamicContentSections.forEach(section => {
            const controlledBy = section.getAttribute("data-controlled-by");
            if (!controlledBy) return;
            
            const [name, value] = controlledBy.split(":");
            if (!name || !value) return;
            
            const controllingInput = form.querySelector(
                `input[name="${name}"][value="${value}"][type="checkbox"]`
            );
            
            section.classList.toggle("is-hidden", !(controllingInput && controllingInput.checked));
        });*/

        let anySectionVisible = false;

        dynamicContentSections.forEach(section => {
            const controlledBy = section.getAttribute("data-controlled-by");
            if (controlledBy)
            {
                const parts = controlledBy.split(":");
                if (parts.length === 2)
                {
                    const name = parts[0];
                    const value = parts[1];

                    const controllingInput = form.querySelector(`input[name="${name}"][value="${value}"][type="checkbox"]`);
                    if (controllingInput && controllingInput.checked)
                    {
                        section.classList.remove("is-hidden");
                        anySectionVisible = true;
                    } else
                    {
                        section.classList.add("is-hidden");
                    }
                }
            }
        });
    }

    function makeStepVisible(step, stepId)
    {
        updateButtonStates(stepId);
        attachValidationListeners(step);
        updateDynamicContentDisplay();
        checkCurrentStepValidity();
        step.classList.add("is-active"); // This has to be put before the reflow line, else the fade effect will break.
        void window.getComputedStyle(step).opacity; // Force a reflow.
        step.classList.add("fade-in");
    }

    function showStep(targetStepId)
    {
        if (!isTransitioning)
        {
            isTransitioning = true;

            const currentStep = document.getElementById(currentStepId);
            const targetStep = document.getElementById(targetStepId);

            currentStep.classList.remove("fade-in");
            currentStep.classList.add("fade-out");

            setTimeout(function()
            {
                // Update the previous form step.
                currentStep.classList.remove("is-active");
                currentStep.classList.remove("fade-out");

                // Update the next form step.
                makeStepVisible(targetStep, targetStepId);
                setTimeout(function()
                {
                    updateProgressIndicator(targetStepId);
                    currentStepId = targetStepId;
                    isTransitioning = false;
                }, transitionDelay);
            }, transitionDelay);
        }
    }

    function isParentStepSameAsCurrentStep(element, stepId)
    {
        const parentStep = element.closest(".form-step");
        if (parentStep && parentStep.id === stepId)
        {
            return true;
        }
        return false;
    }

    function updateButtonStates(stepId)
    {
        const stepIndex = formSteps.findIndex(step => step.id === stepId);
        const isFirst = stepIndex === 0;
        const isLast = stepIndex === formSteps.length - 1;

        // Update Previous buttons
        previousButtons.forEach(button => {
            if (isParentStepSameAsCurrentStep(button, stepId))
            {
                button.disabled = isFirst;
                button.style.visibility = isFirst ? "hidden" : "visible";
            }
        });

        // Update Next buttons
        nextButtons.forEach(button => {
            if (isParentStepSameAsCurrentStep(button, stepId))
            {
                if (isLast)
                {
                    button.type = "submit";
                    button.innerHTML = `
                        <span>Submit</span>
                        <span class="icon"><i class="fa-solid fa-paper-plane"></i></span>
                    `;
                } else
                {
                    button.type = "button";
                    button.innerHTML = `
                        <span>Next</span>
                        <span class="icon"><i class="fa-solid fa-arrow-right"></i></span>
                    `;
                }
            }
        });
    }

    function checkCurrentStepValidity()
    {
        const currentStep = document.getElementById(currentStepId);

        let allValid = true;

        const requiredFields = currentStep.querySelectorAll("[required]");
        requiredFields.forEach(field => {
            const parentDynamicSection = field.closest(".dynamic-content-section");
            if (!parentDynamicSection || !parentDynamicSection.classList.contains("is-hidden"))
            {
                if (!field.checkValidity())
                {
                    allValid = false;
                }
            }
        });

        const stepControllingCheckboxes = currentStep.querySelectorAll(".controls-dynamic-content");
        if (stepControllingCheckboxes.length > 0)
        {
            let foundTickedCheckbox = false;
            for (const checkbox of stepControllingCheckboxes)
            {
                if (checkbox.checked)
                {
                    foundTickedCheckbox = true;
                    break;
                }
            }

            allValid = allValid && foundTickedCheckbox;
        }

        const nextButton = currentStep.querySelector(".next-step");
        if (nextButton)
        {
            nextButton.disabled = !allValid;
        }

        return allValid;
    }

    function attachValidationListeners(stepElement)
    {
        const requiredFields = stepElement.querySelectorAll("[required]");
        requiredFields.forEach(field => {
            field.removeEventListener("input", checkCurrentStepValidity);
            field.removeEventListener("change", checkCurrentStepValidity);
            field.addEventListener("input", checkCurrentStepValidity);
            field.addEventListener("change", checkCurrentStepValidity);
        });
    }

    previousButtons.forEach(button => {
        button.addEventListener("click", function()
        {
            const targetStepId = button.getAttribute("data-step-id");
            if (targetStepId !== "" && !isTransitioning)
            {
                showStep(targetStepId);
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener("click", function(event)
        {
            if (checkCurrentStepValidity() && !isTransitioning)
            {
                const targetStepId = button.getAttribute("data-step-id");
                if (button.type === "submit")
                {
                    form.submit();
                } else if (targetStepId)
                {
                    event.preventDefault();
                    showStep(targetStepId);
                }
            } else
            {
                if (button.type !== "submit")
                {
                    event.preventDefault();
                }
            }
        });
    });

    controllingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function()
        {
            checkCurrentStepValidity();
            updateDynamicContentDisplay();
        });
    });

    updateProgressIndicator(currentStepId);
    makeStepVisible(document.getElementById(currentStepId), currentStepId);
    setTimeout(function()
    {
        isTransitioning = false;
    }, transitionDelay);
});