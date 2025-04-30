document.addEventListener("DOMContentLoaded", function()
{
    const eventItems = document.querySelectorAll("#events .event");
    const eventCards = document.querySelectorAll("#events .card");

    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
    {
        const delay = 250;

        const eventItemObserver = new IntersectionObserver(function(entries)
        {
            entries.forEach(function(entry, index)
            {
                if (entry.isIntersecting)
                {
                    setTimeout(function()
                    {
                        entry.target.classList.add("fade-in");
                        eventItemObserver.unobserve(entry.target);
                    }, index * delay);
                }
            });
        }, {
            threshold: 0.15
        });
        const eventCardObserver = new IntersectionObserver(function(entries)
        {
            entries.forEach(function(entry, index)
            {
                if (entry.isIntersecting)
                {
                    setTimeout(function()
                    {
                        entry.target.classList.add("fade-in");
                        eventCardObserver.unobserve(entry.target);
                    }, index * delay);
                }
            });
        }, {
            threshold: 0.15
        });

        eventItems.forEach(eventItem => eventItemObserver.observe(eventItem));
        eventCards.forEach(eventCard => eventCardObserver.observe(eventCard));
    } else
    {
        eventItems.forEach(function(eventItem)
        {
            eventItem.classList.add("fade-in");
        });
        eventCards.forEach(function(eventCard)
        {
            eventCard.classList.add("fade-in");
        });
    }
});