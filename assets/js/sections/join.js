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
    const transitionDelay = 1000;
    const toastDuration = 3000;

    let isContentLoaded = false;
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
                    const isVisible = controllingInput && controllingInput.checked;
                    const wasVisible = !section.classList.contains("is-hidden");

                    section.classList.toggle("is-hidden", !isVisible);

                    const requiredFields = section.querySelectorAll("[required], [data-require-one='true'], [data-was-required='true']");
                    requiredFields.forEach(function(field)
                    {
                        if (!isVisible)
                        {
                            if (field.hasAttribute("required"))
                            {
                                field.setAttribute("data-was-required", "true");
                                field.removeAttribute("required");
                            }
                        } else
                        {
                            if (field.getAttribute("data-was-required") === "true")
                            {
                                field.setAttribute("required", "");
                            }
                        }
                    });

                    if (wasVisible && !isVisible)
                    {
                        section.querySelectorAll("input[type='text'], input[type='number'], input[type='email'], input[type='tel'], textarea").forEach(function(field)
                        {
                            field.value = "";
                        });

                        section.querySelectorAll("select").forEach(function(select)
                        {
                            select.selectedIndex = 0;
                        });

                        section.querySelectorAll("input[type='checkbox']").forEach(function(checkbox)
                        {
                            if (!checkbox.classList.contains("controls-dynamic-content"))
                            {
                                checkbox.checked = false;
                            }
                        });

                        const radioGroups = new Set();
                        section.querySelectorAll("input[type='radio']").forEach(function(radio)
                        {
                            radioGroups.add(radio.name);
                        });
                        radioGroups.forEach(function(groupName)
                        {
                            const radios = section.querySelectorAll(`input[name="${groupName}"]`);
                            radios.forEach(function(radio)
                            {
                                radio.checked = false;
                            });
                        });

                        // Only show toasts after the content has fully loaded.
                        if (isContentLoaded)
                        {
                            Toastify({
                                text: `Input fields for ${value.charAt(0).toUpperCase()}${value.slice(1)} have been cleared!`,
                                duration: toastDuration,
                                style: {
                                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                                },
                            }).showToast();
                        }
                    }
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
        const step = document.getElementById(stepId);

        let isValid = true;

        // Validate standard required fields.
        const requiredFields = step.querySelectorAll("[required]");
        requiredFields.forEach(function(field)
        {
            const parentDynamicSection = field.closest(".dynamic-content-section");
            if (!parentDynamicSection || !parentDynamicSection.classList.contains("is-hidden"))
            {
                if (!field.checkValidity())
                {
                    isValid = false;
                }
            }
        });

        // Validate required checkbox groups.
        const requiredCheckboxGroups = step.querySelectorAll("[data-require-one='true']");
        requiredCheckboxGroups.forEach(function(group) {
            const parentDynamicSection = group.closest(".dynamic-content-section");
            if (!parentDynamicSection || !parentDynamicSection.classList.contains("is-hidden"))
            {
                const checkboxes = group.querySelectorAll("input[type='checkbox']");
                if (!Array.from(checkboxes).some(checkbox => checkbox.checked))
                {
                    isValid = false;
                }
            }
        });

        // Check that at least one option is selected for controlling checkboxes.
        const stepControllingCheckboxes = step.querySelectorAll(".controls-dynamic-content");
        if (stepControllingCheckboxes.length > 0)
        {
            isValid = isValid && Array.from(stepControllingCheckboxes).some(checkbox => checkbox.checked);
        }

        const nextButton = step.querySelector(".next-step-button");
        if (nextButton)
        {
            nextButton.disabled = !isValid;
        }

        return isValid;
    }

    function makeStepVisible(step, stepId)
    {
        const allFields = step.querySelectorAll("input, textarea, select");
        allFields.forEach(function(field)
        {
            field.removeEventListener("input", field._validateListener);
            field.removeEventListener("change", field._validateListener);

            const listener = () => validateStep(stepId);
            field._validateListener = listener;

            field.addEventListener("input", listener);
            field.addEventListener("change", listener);
        });

        updateDynamicContent();
        validateStep(stepId);

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
                    const allDynamicSections = form.querySelectorAll(".dynamic-content-section");
                    allDynamicSections.forEach(function(section)
                    {
                        if (section.classList.contains("is-hidden"))
                        {
                            // Remove required attributes from hidden fields.
                            const fieldsWithRequiredData = section.querySelectorAll("[data-was-required]");
                            fieldsWithRequiredData.forEach(function(field)
                            {
                                field.removeAttribute("required");
                            });

                            // Disable all form fields in hidden sections so they don't get submitted.
                            // This prevents empty or partial data from hidden sections being submitted.
                            section.querySelectorAll("input, textarea, select").forEach(function(field)
                            {
                                field.disabled = true;
                            });
                        } else
                        {
                            const fieldsWithRequiredData = section.querySelectorAll("[data-was-required]");
                            fieldsWithRequiredData.forEach(function(field)
                            {
                                field.setAttribute("required", "");
                            });
                        }
                    });

                    // TODO: Replace this with form actions.
                    event.preventDefault();
                    alert("Thank you for your submission!");
                    window.location.href = "/";
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
            updateDynamicContent();
            validateStep(currentStepId);
        });
    });

    updateProgressIndicator(currentStepId);
    makeStepVisible(document.getElementById(currentStepId), currentStepId);
    setTimeout(function()
    {
        isTransitioning = false;
    }, transitionDelay);
    isContentLoaded = true;
});