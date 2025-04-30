function toggleAccordion(header)
{
    const body = header.nextElementSibling;
    const chevron = header.querySelector(".fa-chevron-down");
    const isActive = !body.classList.contains("is-hidden");

    document.querySelectorAll(".message-body").forEach(function(item)
    {
        item.classList.add("is-hidden");
    });
    document.querySelectorAll(".fa-chevron-down").forEach(function(icon)
    {
        icon.classList.remove("fa-rotate-180");
    });

    if (isActive)
    {
        body.classList.add("is-hidden");
        chevron.classList.remove("fa-rotate-180");
    } else
    {
        body.classList.remove("is-hidden");
        chevron.classList.add("fa-rotate-180");
    }
}