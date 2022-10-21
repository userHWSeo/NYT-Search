import { API_KEY } from "./api.js";
// html elements Variable
const input = document.querySelector("input");
const newsMainPage = document.querySelector("#news-container");

const searchHistoryContainer = document.querySelector(
  "#search-history-container"
);
const form = document.querySelector("form");
const clipToggle = document.querySelector("#toggle");

// global Variable
let clipNews = [];
let allNews = [];
let searchHistory = [];
let clipToggleBooelean = true;
let page = 0;
let inputValue = "";

// NYT API
async function ntyAPI(page, search) {
  return await fetch(
    `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=election&fq=${search}&page=${page}&api-key=${API_KEY}`
  )
    .then((res) => res.json())
    .then((data) => data)
    .catch(console.error());
}

// Search Delay
const delay = (() => {
  let timer = 0;
  return function (callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

function renderNews(data) {
  data.response.docs.map((doc) => {
    const newsForm = document.createElement("li");
    const urlLink = document.createElement("a");
    const urlBtn = document.createElement("button");
    const clipBtn = document.createElement("button");
    const news = document.createElement("p");
    newsMainPage.appendChild(newsForm);
    newsForm.setAttribute("id", doc._id);
    newsForm.appendChild(news);
    newsForm.appendChild(urlLink);
    urlLink.appendChild(urlBtn);
    newsForm.appendChild(clipBtn);
    urlLink.setAttribute("target", "_blank");
    urlLink.setAttribute("rel", "noopener");
    urlLink.setAttribute("href", doc.web_url);
    news.innerText = doc.abstract + "\n" + doc.pub_date.slice(0, 10);
    urlBtn.innerText = "URL 이동";
    clipBtn.innerText = "Clip !";
    allNews.push(newsForm);

    clipBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (clipBtn.innerText === "Clip !") {
        clipNews.push(newsForm);
        clipBtn.innerText = "Unclip !";
      } else {
        let remakeClipNews = clipNews.filter((el) => el !== newsForm);
        clipNews = remakeClipNews;
        clipBtn.innerText = "Clip !";
      }
    });
  });
}

// Infinity Scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    // 맨 마지막 요소 교차 시 page를 추가로 가져옴
    if (entry.isIntersecting) {
      ntyAPI((page += 1), inputValue).then((data) => {
        renderNews(data);
        // target 해제
        io.unobserve(entry.target);
        io.observe(newsMainPage.lastChild);
      });
    }
  });
});

// Automatic Search
form.addEventListener("keyup", (event) => {
  event.preventDefault();
  inputValue = event.target.value;
  while (newsMainPage.hasChildNodes()) {
    newsMainPage.removeChild(newsMainPage.firstChild);
  }
  delay(() => {
    page = 0;
    if (searchHistory.length >= 5) searchHistory = searchHistory.slice(0, -1);
    searchHistory.splice(0, 0, inputValue);
    if (searchHistoryContainer.childElementCount >= 5) {
      searchHistoryContainer.removeChild(searchHistoryContainer.lastChild);
    }
    const history = document.createElement("li");
    searchHistoryContainer.prepend(history);
    history.innerText = searchHistory[0];
    ntyAPI(page, inputValue).then((data) => {
      renderNews(data);
      io.observe(newsMainPage.lastChild);
    });
  }, 500);
});

// clipToggle
clipToggle.addEventListener("click", (event) => {
  event.preventDefault();
  // See Clip ! 클릭 시 모든 요소 지우고 clipNews 렌더
  if (clipToggleBooelean === true) {
    clipToggleBooelean = false;
    clipToggle.innerText = "See Unclip !";
    while (newsMainPage.hasChildNodes()) {
      newsMainPage.removeChild(newsMainPage.firstChild);
    }
    clipNews.forEach((el) => {
      newsMainPage.appendChild(el);
    });
  } else {
    // See Unclip !
    clipToggleBooelean = true;
    clipToggle.innerText = "See Clip !";
    while (newsMainPage.hasChildNodes()) {
      newsMainPage.removeChild(newsMainPage.firstChild);
    }
    allNews.forEach((el) => {
      newsMainPage.appendChild(el);
    });
  }
});

input.addEventListener("focus", () => {
  searchHistoryContainer.style.display = "block";
});
input.addEventListener("blur", () => {
  searchHistoryContainer.style.display = "none";
});
