let lastSearchs = [];

function calculatePercentage(Ratings) {
    let temp;
    for (let i = 0; i < Ratings.length; i++) {
        if (Ratings[i].Source === "Internet Movie Database") {
            temp = Ratings[i].Value;
        }
    }
    let tenBaseRatio = temp.split("/")[0];
    return tenBaseRatio * 10;
}

function wearListField(response) {
    if (response.Poster !== "N/A") {
        $(".result-image").css("background-image", "url(" + response.Poster + ")");
    } else {
        $(".result-image").css("background-image", "url('noimage.jpg')");
    }
    if (response.Title !== "N/A") {
        $(".result-name").html(response.Title);
    } else {
        $(".result-name").html("N/A");
    }
    fillLoaderBar(response);
}

function listLastSearches(list) {
    $(".searchHistory").children().not(":first").remove();
    let historyItems = "";
    list.map(function (item, index) {
        historyItems += '<div class="searchItem"><p class="searchItemTitle">' + item + '</p><div class="closer"><a><span id="' + index + '">x</span></a></div></div>'
    });
    $(".searchHistory").append(historyItems);
}

function fillLoaderBar(param) {
    if (param.Ratings.length) {
        let percentage = calculatePercentage(param.Ratings);
        if (percentage < 50) {
            $(".meter span").css("background-color", "red");
        } else if (percentage > 50 && percentage < 75) {
            $(".meter span").css("background-color", "yellow");
        } else {
            $(".meter span").css("background-color", "green");
        }
        $(".result-ratio").html(percentage + "%");
        $(".meter span").css("width", percentage + "%");
    } else {
        $(".result-ratio").html("N/A");
        $(".meter span").css("width", "0%");
    }
}

function addToLocalStorage(inputValue) {
    if (inputValue.length) {
        lastSearchs.push(inputValue);
        if (lastSearchs.length > 10) {
            let newArr = lastSearchs.slice(-10);
            localStorage.setItem("searchedKeys", JSON.stringify(newArr));
            listLastSearches(newArr);
        } else {
            localStorage.setItem("searchedKeys", JSON.stringify(lastSearchs));
            listLastSearches(lastSearchs);
        }
    }
}

function showSearchHistoryField(){
    $(".searchHistory").css("display", "inline-table");
}

function hideSearchHistoryField(){
    $(".searchHistory").css("display", "none");
}

function showLoadingField(){
    $(".loading-field").css("display","block");
    $(".error-field, .list-field").css("display","none");
}

function hideLoadingField(){
    $(".loading-field").css("display","none");
}

$(document).ready(function () {
    hideSearchHistoryField();
    let history = JSON.parse(localStorage.getItem("searchedKeys"));
    if (history.length) {
        showSearchHistoryField();
        lastSearchs = JSON.parse(localStorage.getItem("searchedKeys"));
        listLastSearches(lastSearchs);
    }
});

$("#searchButton").on("click", function () {
    showLoadingField();
    let inputValue = $(".search-group input").val();
    $.ajax({
        url: "http://www.omdbapi.com/?apikey=<API_KEY>&t=" + inputValue,
        type: "get",
        success: function (res) {
            if (res.Error) {
                hideLoadingField();
                $(".error-field p").html("An error occured when search '"+inputValue+"'  : " + res.Error);
                $(".error-field").fadeIn(1000);
                setTimeout(function () {
                    $(".error-field").fadeOut(1000);
                },4000);

            } else {
                hideLoadingField();
                showSearchHistoryField();
                wearListField(res);
                $(".list-field").css("display", "inline-flex");
                addToLocalStorage(inputValue);
            }
        },
        error: function () {
            alert("Bir hatayla karşılaşıldı");
        }
    });
});

$(".searchHistory").on("click", "span", function () {
    let elementId = this.getAttribute("id");
    lastSearchs.splice(elementId, 1);
    listLastSearches(lastSearchs);
    localStorage.setItem("searchedKeys", JSON.stringify(lastSearchs));
    if(!lastSearchs.length){
        hideSearchHistoryField();
    }
});

$(".searchHistory").on("click", ".searchItemTitle", function () {
    let text = $(this).html();
    $(".search-group input")[0].value = text;
    $("#searchButton").click();
})
