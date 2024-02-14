import { google } from 'googleapis';

import { truncateWords } from './utils.js';

const youtube = google.youtube('v3');

const apiKey = process.env.YOUTUBE_API_KEY;

const thumbnailRegex = /i.ytimg\.com\/vi\/([a-zA-Z0-9_-]+)/;

/**
 * 
 * @param {string} videoId 
 * @returns {object}
 */
export async function getVideoInfo(videoId) {
  const res = await youtube.videos.list({
    key: apiKey,
    part: 'snippet',
    id: videoId,
  });

  const [item] = res.data.items

  return {
    title: item.snippet.title,
    photoURL: item.snippet.thumbnails.high.url,
    description: truncateWords(item.snippet.description, 7),
  };
}

export async function searchVideos(query) {
  const res = await youtube.search.list({
    key: apiKey,
    part: 'snippet',
    q: query,
  });


  return res.data.items.map((item) => {
    let videoId = item?.id?.videoId
    if (!videoId) {
      const url = item?.snippet?.thumbnails?.default?.url;

      if (thumbnailRegex.test(url)) {
        videoId = url.match(thumbnailRegex)?.[1];
      }
    }
    
    return ({
    thumbnailURL: item.snippet.thumbnails.default.url,
    photoURL: item.snippet.thumbnails.high.url,
    title: item.snippet.title,
    videoId: videoId,
    description: item.snippet.description,
  })});
}
