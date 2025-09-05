
function setGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Welcome Kale and Arugula!";

  if (hour >= 5 && hour < 12) {
    greeting = "☀️ Good morning, Kale and Arugula!";
  } else if (hour >= 12 && hour < 17) {
    greeting = "🌤 Good afternoon, Kale and Arugula!";
  } else {
    greeting = "🌙 Good evening, Kale and Arugula!";
  }

  document.getElementById("greeting").textContent = greeting;
}

setGreeting(); // run once when the page loads
setInterval(setGreeting, 60 * 60 * 1000); // update every hour

// CLOCK
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
setInterval(updateClock, 1000);
updateClock();

// ===== Weather Widget (Current + 5-Day Forecast) =====
const latitude = 41.8781;     // Chicago
const longitude = -87.6298;

function getWeather() {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`)
    .then(res => res.json())
    .then(data => {
      // === Current Weather ===
      const temp = data.current.temperature_2m;
      const code = data.current.weathercode;
      const wind = data.current.windspeed_10m;
      const sunrise = formatTime(data.daily.sunrise[0]);
      const sunset = formatTime(data.daily.sunset[0]);

      document.getElementById("current-weather").innerHTML =
        `🌡 ${temp}°F, ${getWeatherDescription(code)}<br>
         💨 Wind: ${wind} mph<br>
         🌅 Sunrise: ${sunrise} &nbsp;&nbsp; 🌇 Sunset: ${sunset}`;

      // === 5-Day Forecast ===
      const forecastContainer = document.getElementById("forecast-cards");
      forecastContainer.innerHTML = "";

      // Force day names starting from today
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

      for (let i = 0; i < 5; i++) {
        const dayName = dayNames[(todayIndex + i) % 7];
        const min = data.daily.temperature_2m_min[i];
        const max = data.daily.temperature_2m_max[i];
        const dayCode = data.daily.weathercode[i];

        const card = document.createElement("div");
        card.className = "forecast-day";
        card.innerHTML = `
          <strong>${dayName}</strong><br>
          ${getWeatherEmoji(dayCode)}<br>
          ${min}° / ${max}°F
        `;
        forecastContainer.appendChild(card);
      }
    })
    .catch(err => {
      console.error("Weather fetch failed:", err);
      document.getElementById("current-weather").innerHTML = "<p>Unable to load weather data.</p>";
    });
}


function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Snow",
    80: "Rain showers",
    95: "Thunderstorm"
  };
  return descriptions[code] || "Unknown";
}

function getWeatherEmoji(code) {
  const emojis = {
    0: "☀️",
    1: "🌤",
    2: "⛅",
    3: "☁️",
    45: "🌫",
    48: "🌫",
    51: "🌦",
    53: "🌧",
    55: "🌧",
    61: "🌧",
    63: "🌧",
    65: "🌧",
    71: "❄️",
    80: "🌦",
    95: "⛈"
  };
  return emojis[code] || "❓";
}

function formatTime(isoString) {
  const time = new Date(isoString);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

getWeather();
setInterval(getWeather, 900000); // Update 15 minute

// ===== NEWS (NYT RSS via rss2json API) =====
fetch("https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/US.xml")
  .then(res => {
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("nyt-news-container");
    container.innerHTML = "";

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("No news items found in API response");
    }

    data.items.slice(0, 3).forEach(item => {
      let thumb = item.thumbnail || extractImageFromContent(item.content);
      if (!thumb) {
        thumb = "https://via.placeholder.com/80?text=News";
      }

      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <img src="${thumb}" alt="News image" class="news-thumb" onerror="this.style.display='none'"/>
        <div class="news-content">
          <h3>${item.title}</h3>
          <p class="news-source">${item.author || "NY Times"}</p>
        </div>`;
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error("NYT fetch failed:", err);
    document.getElementById("nyt-news-container").innerHTML = `<p>Sorry, NYT news is unavailable right now.</p>`;
  });

// ===== NEWS (Good News Network RSS via rss2json API) =====
fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.goodnewsnetwork.org/feed/")
  .then(res => {
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("goodnews-container");
    container.innerHTML = "";

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("No news items found in API response");
    }

    data.items.slice(0, 3).forEach(item => {
      let thumb = item.thumbnail || extractImageFromContent(item.content);
      if (!thumb) {
        thumb = "https://via.placeholder.com/80?text=News";
      }

      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <img src="${thumb}" alt="News image" class="news-thumb" onerror="this.style.display='none'"/>
        <div class="news-content">
          <h3>${item.title}</h3>
          <p class="news-source">${item.author || "Good News Network"}</p>
        </div>`;
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Good News fetch failed:", err);
    document.getElementById("goodnews-container").innerHTML = `<p>Sorry, Good News is unavailable right now.</p>`;
  });

// Helper function to extract image URL from HTML content
function extractImageFromContent(html) {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}




// // PHOTO CAROUSEL
// const photos = ['photos/img1.jpg', 'photos/img2.jpg', 'photos/img3.jpg'];
// let index = 0;
// const img = document.getElementById('carousel-img');

// setInterval(() => {
//   index = (index + 1) % photos.length;
//   img.src = photos[index];
// }, 8000);
