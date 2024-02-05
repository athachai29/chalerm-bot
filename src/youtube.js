import { google } from 'googleapis';

const youtube = google.youtube('v3');

const apiKey = process.env.YOUTUBE_API_KEY;

export async function getVideoInfo(videoId) {
  const res = await youtube.videos.list({
    key: apiKey,
    part: 'snippet,contentDetails',
    id: videoId,
  });

  return res.data.items[0].snippet.title;
}

export async function searchVideos(query) {
  const res = await youtube.search.list({
    key: apiKey,
    part: 'snippet',
    q: query,
  });

  return res.data.items.map((item) => ({
    thumbnailURL: item.snippet.thumbnails.default.url,
    photoURL: item.snippet.thumbnails.high.url,
    title: item.snippet.title,
    videoId: item.id.videoId,
    description: item.snippet.description,
  }));
}
