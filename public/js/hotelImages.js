
//use API to get images link and export into HotelWithinImages.csv

const fetch = require('node-fetch');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const UNSPLASH_ACCESS_KEY = '_CXG9ripnku68iSxYMdlrrIsQtrWv6ae1MLSsWQ0LXg';
const hotels = [];

fs.createReadStream('HotelNames.csv')
.pipe(csv({ skipLines: 1 }))
  .on('data', (row) => hotels.push(row))
  .on('end', async () => {
    for (let hotel of hotels) {
      
      const name = hotel.hotelname;
      const query = `${name} hotel Kuala Lumpur`;

      try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          hotel.image_url = data.results[0].urls.regular;
        } else {
          hotel.image_url = '';
        }

        console.log(`✅ Fetched image for ${name}`);
      } catch (error) {
        console.error(`❌ Error for ${name}:`, error);
        hotel.image_url = '';
      }
    }

    // Write to new CSV
    const csvWriter = createCsvWriter({
      path: 'HotelWithimages.csv',
      header: Object.keys(hotels[0]).map(key => ({ id: key, title: key })),
    });

    await csvWriter.writeRecords(hotels);
    console.log('✅ New CSV with Unsplash images created!');
  });
