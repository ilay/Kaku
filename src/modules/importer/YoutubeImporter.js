import UniqueId from 'kaku-core/modules/UniqueId';
import Youtube from '../wrapper/Youtube';
import PlaylistManager from '../../modules/PlaylistManager';
import YoutubeTrack from 'kaku-core/models/track/YoutubeTrack';

function YoutubeImporter() {
  // TODO
  // we need to add more protect here
  this._regex = /[&?]list=([a-z0-9_-]+)/i;
}

YoutubeImporter.prototype._getPlaylistTitle = function(id) {
  let promise = new Promise((resolve, reject) => {
    Youtube.getPlayListsById(id, function(error, result) {
      if (error) {
        reject(error);
      }
      else {
        let title =
          result.items &&
          result.items[0] &&
          result.items[0].snippet &&
          result.items[0].snippet.title ||
          'playlist - ' + UniqueId(6);
        resolve(title);
      }
    });
  });
  return promise;
};

YoutubeImporter.prototype.import = function(url) {
  let id = this._parsePlaylistId(url);
  if (!id) {
    return Promise.reject();
  }

  return this._getPlaylistTitle(id).then((title) => {
    return PlaylistManager.addYoutubePlaylist(title, id);
  }).then((playlist) => {
    let promise = new Promise((resolve, reject) => {
      // TODO
      // support paging to make sure we can fetch all items back
      Youtube.getPlayListsItemsById(id, 50, function(error, result) {
        if (error) {
          reject(error);
        }
        else {
          let rawTracks = result.items || [];
          // change from rawData into YoutubeTrack
          let tracks = rawTracks.map((rawTrack) => {
            let youtubeTrack = new YoutubeTrack();
            youtubeTrack.initYoutubeResult(rawTrack);
            return youtubeTrack;
          });
          // add all tracks in one operation
          playlist.addTracks(tracks).then(() => {
            resolve(playlist);
          });
        }
      });
    });
    return promise;
  });
};

YoutubeImporter.prototype._parsePlaylistId = function(url) {
  url = url || '';
  let result;
  let matches = url.match(this._regex);
  if (matches && matches.length > 0) {
    return matches[1];
  }
};

module.exports = new YoutubeImporter();
