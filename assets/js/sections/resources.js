document.addEventListener("DOMContentLoaded", function()
{
    document.querySelectorAll("#resources .accordion-item .accordion-item-header button").forEach(function(button)
    {
        const body = document.getElementById(button.getAttribute("aria-controls"));
        const chevron = button.querySelector(".fa-chevron-down");

        button.addEventListener("click", () => toggleAccordion(body, button, chevron));

        button.addEventListener("keydown", function(event)
        {
            if (event.key === "Enter")
            {
                event.preventDefault();
                toggleAccordion(body, button, chevron);
            }
        });
    });

    function toggleAccordion(body, button, chevron)
    {
        const isExpanded = button.getAttribute("aria-expanded") === "true";

        document.querySelectorAll("#resources .accordion-item .accordion-item-body.is-active").forEach(function(openBody)
        {
            if (openBody !== body)
            {
                const openButton = document.querySelector(`[aria-controls="${openBody.id}"]`);
                const openChevron = openButton?.querySelector(".fa-chevron-down");
                closeAccordionItem(openBody, openButton, openChevron);
            }
        });

        if (!isExpanded)
        {
            openAccordionItem(body, button, chevron);
        } else
        {
            closeAccordionItem(body, button, chevron);
        }
    }

    function openAccordionItem(body, button, chevron)
    {
        body.classList.add("is-active");
        body.style.maxHeight = `${body.scrollHeight}px`;
        body.querySelector(".button").tabIndex = "0";
        button.setAttribute("aria-expanded", "true");
        chevron.style.transform = "rotateZ(180deg)";
    }

    function closeAccordionItem(body, button, chevron)
    {
        body.classList.remove("is-active");
        body.style.maxHeight = null;
        body.querySelector(".button").tabIndex = "-1";
        button.setAttribute("aria-expanded", "false");
        chevron.style.transform = "rotateZ(0deg)";
    }
});