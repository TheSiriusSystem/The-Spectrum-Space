document.addEventListener("DOMContentLoaded", function()
{
    const timelineItems = document.querySelectorAll("#stories .timeline .timeline-item .box");

    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
    {
        const timelineItemObserver = new IntersectionObserver(function(entries)
        {
            entries.forEach(function(entry)
            {
                if (entry.isIntersecting)
                {
                    entry.target.classList.add("fade-in");
                    entry.target.parentElement.querySelector(".timeline-marker").classList.add("fade-in");
                    timelineItemObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        timelineItems.forEach(timelineItem => timelineItemObserver.observe(timelineItem));
    } else
    {
        timelineItems.forEach(function(timelineItem)
        {
            timelineItem.classList.add("fade-in");
        });
    }
});