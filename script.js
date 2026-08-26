/* =========================================================
   LET'S SCORE — LIGHTWEIGHT JAVASCRIPT
========================================================= */


/* =========================================================
   ROTATING SCIENTIST QUOTES
========================================================= */

const scientistQuotes = [

    {
        quote: "The important thing is not to stop questioning.",
        name: "Albert Einstein",
        field: "Physics"
    },

    {
        quote: "Nothing in life is to be feared; it is only to be understood.",
        name: "Marie Curie",
        field: "Physics & Chemistry"
    },

    {
        quote: "Somewhere, something incredible is waiting to be known.",
        name: "Carl Sagan",
        field: "Astronomy & Science"
    },

    {
        quote: "Science is a way of thinking much more than it is a body of knowledge.",
        name: "Carl Sagan",
        field: "Science & Astronomy"
    },

    {
        quote: "The most beautiful experience we can have is the mysterious.",
        name: "Albert Einstein",
        field: "Physics"
    },

    {
        quote: "Equipped with his five senses, man explores the universe around him and calls the adventure Science.",
        name: "Edwin Hubble",
        field: "Astronomy"
    },

    {
        quote: "An investment in knowledge pays the best interest.",
        name: "Benjamin Franklin",
        field: "Science & Philosophy"
    },

    {
        quote: "We cannot solve our problems with the same thinking we used when we created them.",
        name: "Albert Einstein",
        field: "Physics & Philosophy"
    }

];


let currentQuote = 0;

const quoteCard =
    document.getElementById("quote-card");

const quoteText =
    document.getElementById("scientist-quote");

const quoteName =
    document.getElementById("scientist-name");

const quoteField =
    document.getElementById("scientist-field");


/* =========================================================
   CHANGE QUOTE
========================================================= */

function showNextQuote(){

    if(
        !quoteCard ||
        !quoteText ||
        !quoteName ||
        !quoteField
    ){
        return;
    }

    quoteCard.classList.add("fade-out");


    window.setTimeout(function(){

        currentQuote =
            (currentQuote + 1) %
            scientistQuotes.length;

        const item =
            scientistQuotes[currentQuote];

        quoteText.textContent =
            item.quote;

        quoteName.textContent =
            "— " + item.name;

        quoteField.textContent =
            item.field;

        quoteCard.classList.remove(
            "fade-out"
        );

    },450);
}


/* =========================================================
   ROTATE EVERY 5 SECONDS
========================================================= */

window.setInterval(
    showNextQuote,
    5000
);


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const navLinks =
            document.querySelectorAll(
                ".main-nav a"
            );

        navLinks.forEach(
            function(link){

                link.addEventListener(
                    "click",
                    function(){

                        navLinks.forEach(
                            function(item){
                                item.classList.remove(
                                    "active"
                                );
                            }
                        );

                        link.classList.add(
                            "active"
                        );

                    }
                );

            }
        );

    }
);
