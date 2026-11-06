import 'dotenv/config';
import https from 'node:https';

const args = process.argv.slice(2);
const params = {
  q: null,
  l: null,
  c: null,
  s: 10, // По умолчанию 10 новостей
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '-q':
      params.q = args[i + 1];
      i++;
      break;
    case '-l':
      params.l = args[i + 1];
      i++;
      break;
    case '-c':
      params.c = args[i + 1];
      i++;
      break;
    case '-s':
      params.s = parseInt(args[i + 1], 10);
      i++;
      break;
  }
}

const baseUrl = 'https://newsapi.org/v2/top-headlines';
const queryParams = new URLSearchParams();

if (params.q) {
  queryParams.append('q', params.q);
} else {
  queryParams.append('country', 'us');
}

if (params.l) queryParams.append('language', params.l);
if (params.c) queryParams.append('category', params.c);
if (params.s) queryParams.append('pageSize', params.s);

const apiKey = process.env.NEWS_API_KEY;
if (!apiKey) {
  console.error('Ошибка: Не найден NEWS_API_KEY в файле .env');
  process.exit(1);
}

const requestUrl = `${baseUrl}?${queryParams.toString()}&apiKey=${apiKey}`;

const fetchNews = url => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'NewsCLI/1.0',
      },
    };

    https
      .get(url, options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
};

const main = async () => {
  console.log(`Запрос: ${baseUrl}?${queryParams.toString()}&apiKey=***`);

  try {
    const raw = await fetchNews(requestUrl);
    const response = JSON.parse(raw);

    if (response.status !== 'ok') {
      console.error('Ошибка API:', response.message);
      return;
    }

    console.log(`\n--- Найдено статей: ${response.articles.length} ---\n`);

    response.articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      if (article.description) console.log(`   ${article.description}`);
      console.log(`   Источник: ${article.source.name}`);
      console.log(`   URL: ${article.url}\n`);
    });
  } catch (error) {
    console.error('Ошибка запроса:', error.message);
  }
};

main();
