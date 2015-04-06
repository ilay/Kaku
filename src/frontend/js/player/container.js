define(function(require) {
  'use strict';

  var React = require('react');
  var PlayerControlButtons = require('player/control-buttons');
  var PlayerTrack = require('player/track');

  var PlayerContainer = React.createClass({
    render: function() {
      return (
        <div className="player">
          <PlayerTrack/>
          <PlayerControlButtons/>
        </div>
      );
    }
  });

  return PlayerContainer;
});