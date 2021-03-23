const lord = {};

// set global variables
let moviesArray;
let movieId;
let quotesArray = [];
let charsArray;

// get movies from api
// and populate form with movies list
lord.getMovies = function(){
    lord.getData('movie').done( function(response){
        
        moviesArray = response.docs;
        
        moviesArray.forEach( function(movie){
            $('select#movie').append(`
                <option value="${movie._id}">${movie.name}</option>
            `);
        })
    
        lord.getFormResults();

    });
}; // end of getMovies

// listen to form
lord.getFormResults = function(){

    // listen to form
    $('form').on("submit", function(event){
        event.preventDefault();
        $('.results').empty();

        movieId = $('#movie option:selected').val();

        // reset quotes array and call function to load quotes from selected movie
        quotesArray = [];
        lord.getAllQuotes();

    }); // end of listening to the form

}; // end of getFormResults()

// get quotes from selected movie
// run the function multiple times until all quotes are stored in the array
// api has a limit of 1000 results
// there are 2389 quotes in the api at the moment
lord.getAllQuotes = function(offset){
    $.ajax({
        url: `https://the-one-api.dev/v2/quote?offset=${offset}`,
        headers: { 'Authorization': 'Bearer ymgKsKhmFApGLPhbQQvS' },
        method: `GET`,
        dataType: `JSON`
    }).then( function(data){
        data.docs.forEach( function(quote){
            quotesArray.push(quote);
        })
        
        offset = quotesArray.length+1;

        // are there more results to get?
        if (offset < data.total){
            lord.getAllQuotes(offset);
        } else {
            lord.getQuote();
        }
    });
        
}; // end lord.getAllQuotes()

// get a random quote that matches the selected movie
lord.getQuote = function(){

    // filter the quotes array getting quotes only from the selected movie
    const quotesFromMovie = quotesArray.filter(function(quote){
        return quote.movie == movieId;
    });
    
    // if there are quotes from the selected movie
    if (quotesFromMovie.length > 0){
    
        // get a random quote
        const randomQuote = quotesFromMovie[Math.floor(Math.random() * quotesFromMovie.length)];

        // display random quote
        $('.form').fadeOut(1);
        $('.results').fadeIn(250).append(`
            <h2>"${randomQuote.dialog}"</h2>
        `)

        // get character details
        lord.getChar(randomQuote.character);

    // if there are no quotes from the selected movie
    } else {

        $('.form').fadeOut(1);
        $('.results').fadeIn(250).append(`
        <h2>Oops</h2>
        <p>Sorry, no quotes from this movie. Please choose another one.</p>
        <button class="try-again">Try again</button>
        `)
    };

}; // end of getQuote()

// get characters, find the character that said the quote and display details
lord.getChar = function(randomQuoteCharId){
    lord.getData('character').done( function(response){
        charsArray = response.docs;

        // find the character who said the quote
        const character = charsArray.filter( function(char){
            return randomQuoteCharId == char._id;
        });
        
        // display character details
        $('.results').append(`
            <p>Said by: <strong>${character[0].name}</strong><br>
            Race: ${character[0].race}<br>
            More info: <a href="${character[0].wikiUrl}" target="_blank">Wiki</a></p>
            <button class="try-again">Try again</button>
        `);

    });
}; // end of getChars

// api call
lord.getData = function(category){

    const apiData = $.ajax({
        url: `https://the-one-api.dev/v2/${category}`,
        headers: { 'Authorization': 'Bearer ymgKsKhmFApGLPhbQQvS' },
        method: `GET`,
        dataType: `JSON`
    });
        return apiData;
};

// listen to try again button
$('.results').on("click", '.try-again', function(){
    $('.form').fadeIn(250);
    $('.results').fadeOut(1);
});

// init
lord.init = function(){
    $('.results').fadeOut(1);
    lord.getMovies();
};

// document ready
$(document).ready( function(){
    lord.init();
});