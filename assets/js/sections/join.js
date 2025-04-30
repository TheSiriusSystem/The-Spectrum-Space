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
                step.classList.remove("is-active");
                step.classList.add("is-completed");
            } else if (index === stepIndex)
            {
                step.classList.add("is-active");
                step.classList.remove("is-completed");
            } else
            {
                step.classList.remove("is-active", "is-completed");
            }
        });

        if (progressLine)
        {
            const percentage = stepIndex === 0 ? 0 : (stepIndex / (formSteps.length - 1)) * 100.0;
            progressLine.style.width = `${percentage}%`;
        }
    }

    function updateDynamicContent()
    {
        dynamicContentSections.forEach(function(section)
        {
            const controlledBy = section.getAttribute("data-controlled-by");
            if (controlledBy)
            {
                const [name, value] = controlledBy.split(":");
                if (name && value)
                {
                    const controllingInput = form.querySelector(`input[name="${name}"][value="${value}"][type="checkbox"]`);
                    section.classList.toggle("is-hidden", !(controllingInput && controllingInput.checked));
                }
            }
        });
    }

    function isElementInStep(element, stepId)
    {
        const parentStep = element.closest(".form-step");
        return parentStep && parentStep.id === stepId;
    }

    function validateStep(stepId)
    {
        const currentStep = document.getElementById(stepId);

        let isValid = true;

        const requiredFields = currentStep.querySelectorAll("[required]");
        requiredFields.forEach(function(field)
        {
            const dynamicSection = field.closest(".dynamic-content-section");
            if (!dynamicSection || !dynamicSection.classList.contains("is-hidden"))
            {
                if (!field.checkValidity())
                {
                    isValid = false;
                }
            }
        });

        const stepControllingCheckboxes = currentStep.querySelectorAll(".controls-dynamic-content");
        if (stepControllingCheckboxes.length > 0)
        {
            console.log("Testa");
            isValid = isValid && Array.from(stepControllingCheckboxes).some(checkbox => checkbox.checked);
        }

        const nextButton = currentStep.querySelector(".next-step-button");
        if (nextButton)
        {
            nextButton.disabled = !isValid;
        }

        return isValid;
    }

    function makeStepVisible(step, stepId)
    {
        const requiredFields = step.querySelectorAll("[required]");
        requiredFields.forEach(function(field)
        {
            field.removeEventListener("input", field._validateListener);
            field.removeEventListener("change", field._validateListener);

            const listener = () => validateStep(stepId);
            field._validateListener = listener;

            field.addEventListener("input", listener);
            field.addEventListener("change", listener);
        });

        validateStep(stepId);
        updateDynamicContent();

        const stepIndex = formSteps.findIndex(step => step.id === stepId);
        const isFirst = stepIndex === 0;
        const isLast = stepIndex === formSteps.length - 1;

        // Update the Previous buttons.
        previousButtons.forEach(function(button)
        {
            if (isElementInStep(button, stepId))
            {
                button.disabled = isFirst;
            }
        });

        // Update the Next buttons.
        nextButtons.forEach(function(button)
        {
            if (isElementInStep(button, stepId))
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
                currentStep.classList.remove("is-active", "fade-out");

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

    previousButtons.forEach(function(button)
    {
        button.addEventListener("click", function()
        {
            const targetStepId = button.getAttribute("data-step-id");
            if (targetStepId)
            {
                showStep(targetStepId);
            }
        });
    });

    nextButtons.forEach(function(button)
    {
        button.addEventListener("click", function(event)
        {
            if (validateStep(currentStepId) && !isTransitioning)
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

    controllingCheckboxes.forEach(function(checkbox)
    {
        checkbox.addEventListener("change", function()
        {
            validateStep(currentStepId);
            updateDynamicContent();
        });
    });

    updateProgressIndicator(currentStepId);
    makeStepVisible(document.getElementById(currentStepId), currentStepId);
    setTimeout(function()
    {
        isTransitioning = false;
    }, transitionDelay);
});