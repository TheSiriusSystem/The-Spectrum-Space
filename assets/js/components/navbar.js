document.addEventListener("DOMContentLoaded", function()
{
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);
    $navbarBurgers.forEach(function(element)
    {
        element.addEventListener("click", function()
        {
            const target = element.dataset.target;
            const $target = document.getElementById(target);

            element.classList.toggle("is-active");
            $target.classList.toggle("is-active");
        });
    });

    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themes = ["pride", "light", "dark"];
    let currentTheme = localStorage.getItem("theme") || "pride";

    applyTheme(currentTheme);

    themeToggle.addEventListener("click", function()
    {
        const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
        currentTheme = nextTheme;
        localStorage.setItem("theme", currentTheme);
        applyTheme(currentTheme);
    });

    function applyTheme(theme)
    {
        const htmlElement = document.documentElement;

        // Temporarily disable transitions during theme change to prevent visual flickering.
        // Animated elements are not affected by this.
        const css = document.createElement("style");
        css.appendChild(document.createTextNode(
            `*:not(.fade-in):not(.flip-in)
            {
                transition: none !important;
            }`
        ));
        htmlElement.appendChild(css);

        htmlElement.classList.remove(...themes);
        htmlElement.classList.add(theme);
        switch (theme)
        {
            case "pride":
                themeIcon.className = "fa-solid fa-rainbow";
                break;
            case "light":
                themeIcon.className = "fa-solid fa-sun";
                break;
            case "dark":
                themeIcon.className = "fa-solid fa-moon";
                break;
        }

        void window.getComputedStyle(css).opacity; // Force a reflow.
        htmlElement.removeChild(css);
    }
});