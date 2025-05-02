document.addEventListener("DOMContentLoaded", function()
{
    const boxes = document.querySelectorAll("#about .value-box");
    const cards = document.querySelectorAll("#about .card");
    const cardImages = document.querySelectorAll("#about .card .card-content img");
    const images = document.querySelectorAll("#about .about-image-wrapper");

    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
    {
        const delay = 250;

        const boxObserver = new IntersectionObserver(function(entries)
        {
            entries.forEach(function(entry, index)
            {
                if (entry.isIntersecting)
                {
                    setTimeout(function()
                    {
                        entry.target.classList.add("fade-in");
                        boxObserver.unobserve(entry.target);
                    }, index * delay);
                }
            });
        }, {
            threshold: 0.2
        });
        const cardObserver = new IntersectionObserver(function(entries)
        {
            entries.forEach(function(entry, index)
            {
                if (entry.isIntersecting)
                {
                    setTimeout(function()
                    {
                        entry.target.classList.add("fade-in");
                        cardObserver.unobserve(entry.target);
                    }, index * delay);
                }
            });
        }, {
            threshold: 0.2
        });
        const imageObserver = new IntersectionObserver(function(entries)
        {
            entries.forEach(function(entry, index)
            {
                if (entry.isIntersecting)
                {
                    setTimeout(function()
                    {
                        entry.target.classList.add("flip-in");
                        imageObserver.unobserve(entry.target);
                    }, index * delay);
                }
            });
        }, {
            threshold: 0.15
        });

        boxes.forEach(box => boxObserver.observe(box));
        cards.forEach(card => cardObserver.observe(card));
        cardImages.forEach(function(cardImage)
        {
            cardImage.addEventListener("mouseenter", function()
            {
                cardImage.classList.add("spinning");
            });

            cardImage.addEventListener("mouseleave", function()
            {
                const computedStyle = window.getComputedStyle(cardImage);
                const transform = computedStyle.getPropertyValue("transform");

                cardImage.classList.remove("spinning");

                // Calculate current rotation angle to ensure smooth return to 0°.
                if (transform && transform !== "none")
                {
                    const values = transform.split("(")[1].split(")")[0].split(",");
                    const a = values[0];
                    const b = values[1];

                    let angle = Math.round(Math.atan2(b, a) * (180.0 / Math.PI));
                    if (angle < 0)
                    {
                        angle += 360;
                    }

                    // Calculate the time needed to return to 0° at constant speed.
                    const degreesPerSecond = 360 / 5.0; // Complete the rotation in 5 seconds.
                    const timeToZero = angle / degreesPerSecond;

                    cardImage.style.transform = `rotateZ(${angle}deg)`;
                    cardImage.style.transition = `transform ${timeToZero}s ease, box-shadow 0.3s ease`;
                }

                // Force the browser to apply style changes before setting target position.
                void cardImage.offsetWidth; // Trigger a reflow.
                cardImage.style.transform = "rotateZ(0deg)";
            });
        });
        images.forEach(image => imageObserver.observe(image));
    } else
    {
        boxes.forEach(function(box)
        {
            box.classList.add("fade-in");
        });
        cards.forEach(function(card)
        {
            card.classList.add("fade-in");
        });
        images.forEach(function(image)
        {
            image.classList.add("flip-in");
        });
    }
});