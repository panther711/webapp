// CallPanel: displays local and remote viewports and controls.
import React from 'react';
import { FormattedMessage } from 'react-intl';

import LetterTile from '../widgets/letter-tile.jsx';

import { CALL_STATE_OUTGOING_INITATED, CALL_STATE_IN_PROGRESS, CALL_WEBRTC_CONFIG,
         MAX_TITLE_LENGTH } from '../config.js';

import { clipStr } from '../lib/utils.js'

export default class CallPanel extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      localStream: undefined,
      pc: undefined,

      previousOnInfo: undefined
    };

    this.localStreamConstraints = {
      audio: true,
      video: true
    };

    this.localRef = React.createRef();
    this.remoteRef = React.createRef();

    this.onInfo = this.onInfo.bind(this);
    this.start = this.start.bind(this);

    this.createPeerConnection = this.createPeerConnection.bind(this);

    this.handleNegotiationNeededEvent = this.handleNegotiationNeededEvent.bind(this);
    this.handleICECandidateEvent = this.handleICECandidateEvent.bind(this);
    this.handleNewICECandidateMsg = this.handleNewICECandidateMsg.bind(this);
    this.handleICEConnectionStateChangeEvent = this.handleICEConnectionStateChangeEvent.bind(this);
    this.handleSignalingStateChangeEvent = this.handleSignalingStateChangeEvent.bind(this);
    this.handleICEGatheringStateChangeEvent = this.handleICEGatheringStateChangeEvent.bind(this);
    this.handleTrackEvent = this.handleTrackEvent.bind(this);

    this.handleVideoOfferMsg = this.handleVideoOfferMsg.bind(this);
    this.handleVideoAnswerMsg = this.handleVideoAnswerMsg.bind(this);
    this.handleNewICECandidateMsg = this.handleNewICECandidateMsg.bind(this);

    this.reportError = this.reportError.bind(this);
    this.handleGetUserMediaError = this.handleGetUserMediaError.bind(this);

    this.stop = this.stop.bind(this);
    this.stopTracks = this.stopTracks.bind(this);

    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleToggleCameraClick = this.handleToggleCameraClick.bind(this);
    this.handleToggleMicClick = this.handleToggleMicClick.bind(this);
    this.toggleMedia = this.toggleMedia.bind(this);

    this.handleRemoteHangup = this.handleRemoteHangup.bind(this);
    this.handleVideoCallAccepted = this.handleVideoCallAccepted.bind(this);
  }

  handleVideoCallAccepted(info) { 
    const pc = this.createPeerConnection();
    const stream = this.state.localStream;
    stream.getTracks().forEach(track => {
      console.log('local stream adding track ', track.id, track.kind, track.readyState);
      pc.addTrack(track, stream);
    });
  }

  onInfo(info) {
    console.log('info --> ', info);
    if (info.what != 'call') {
      return;
    }
    switch (info.event) {
      case 'accept':
        // Call accepted.
        this.handleVideoCallAccepted(info);
        break;
      case 'offer':
        this.handleVideoOfferMsg(info);
        break;
      case 'answer':
        this.handleVideoAnswerMsg(info);
        break;
      case 'ice-candidate':
        this.handleNewICECandidateMsg(info);
        break;
      case 'hang-up':
        this.handleRemoteHangup(info);
        break;
    }
  }

  componentDidMount() {
    const topic = this.props.topic;
    this.previousOnInfo = topic.onInfo;
    topic.onInfo = this.onInfo;
    if ((this.props.callState == CALL_STATE_OUTGOING_INITATED ||
         this.props.callState == CALL_STATE_IN_PROGRESS) && this.localRef.current) {
      this.start();
    }
  }

  componentWillUnmount() {
    this.props.topic.onInfo = this.previousOnInfo;
    console.log('will unmount. stop');
    this.stop();
  }

  start() {
    if (this.state.localStream) {
      console.log("You can't start a call because you already have one open!");
    } else {
      if (this.props.callState == CALL_STATE_IN_PROGRESS) {
        // We apparently just accepted the call.
        this.props.onInvite(this.props.topic.name, this.props.seq, this.props.callState);
        return;
      }
      // This is an outgoing call waiting for the other side to pick up.
      // Start local video.
      navigator.mediaDevices.getUserMedia(this.localStreamConstraints)
        .then(stream => {
          this.setState({localStream: stream});
          this.localRef.current.srcObject = stream;
          // Send call invitation.
          this.props.onInvite(this.props.topic.name, this.props.seq, this.props.callState);
        })
        .catch(this.handleGetUserMediaError);
    }
  }

  createPeerConnection() {
    var pc = new RTCPeerConnection(CALL_WEBRTC_CONFIG);

    pc.onicecandidate = this.handleICECandidateEvent;
    pc.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    pc.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
    pc.onsignalingstatechange = this.handleSignalingStateChangeEvent;
    pc.onnegotiationneeded = this.handleNegotiationNeededEvent;
    pc.ontrack = this.handleTrackEvent;

    this.setState({pc: pc});
    console.log('Created RTCPeerConnnection');
    return pc;
  }

  handleVideoAnswerMsg(info) {
    console.log("*** Call recipient has accepted our call");

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.

    var desc = new RTCSessionDescription(info.payload);
    this.state.pc.setRemoteDescription(desc).catch(this.reportError);
  }

  reportError(errMessage) {
    console.log(`Error ${errMessage.name}: ${errMessage.message}`);
  }

  handleNegotiationNeededEvent() {
    this.state.pc.createOffer().then(offer => {
      return this.state.pc.setLocalDescription(offer);
    })
    .then(() => {
      this.props.onSendOffer(this.props.topic.name, this.props.seq, this.state.pc.localDescription.toJSON());
    })
    .catch(this.reportError);
  }

  handleICECandidateEvent(event) {
    if (event.candidate) {
      this.props.onIceCandidate(this.props.topic.name, this.props.seq, event.candidate.toJSON());
    }
  }

  handleNewICECandidateMsg(info) {
    var candidate = new RTCIceCandidate(info.payload);

    this.state.pc.addIceCandidate(candidate)
      .catch(this.reportError);
  }

  handleICEConnectionStateChangeEvent(event) {
    switch (this.state.pc.iceConnectionState) {
      case "closed":
      case "failed":
        this.handleCloseClick();
        break;
    }
  }

  handleSignalingStateChangeEvent(event) {
    switch (this.state.pc.signalingState) {
      case "closed":
        this.handleCloseClick();
        break;
    }
  }

  handleICEGatheringStateChangeEvent(event) {
    console.log('ICE gathering change state: ', event);
  }

  handleTrackEvent(event) {
    this.remoteRef.current.srcObject = event.streams[0];
    // Make sure we redraw the UI properly.
    this.forceUpdate();
  }

  handleGetUserMediaError(e) {
    console.log('-->', e);
    switch(e.name) {
      case "NotFoundError":
        console.log("Unable to open your call because no camera and/or microphone" +
              "were found.");
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        console.log("Error opening your camera and/or microphone: " + e.message);
        break;
    }

    // Make sure we shut down our end of the RTCPeerConnection so we're
    // ready to try again.
    this.handleCloseClick();
  }

  handleVideoOfferMsg(info) {
    var localStream = null;

    const pc = this.createPeerConnection();

    var desc = new RTCSessionDescription(info.payload);

    pc.setRemoteDescription(desc).then(() => {
      console.log('!!! handleVideoOffer/setRemoteDescription -> getUserMesia');
      return navigator.mediaDevices.getUserMedia(this.localStreamConstraints);
    })
    .then(stream => {
      localStream = stream;
      this.localRef.current.srcObject = stream;
      this.setState({localStream: stream});

      localStream.getTracks().forEach(track => {
        console.log('local stream A adding track ', track.id, track.kind, track.readyState);
        pc.addTrack(track, localStream);
      });
    })
    .then(() => {
      return pc.createAnswer();
    })
    .then(answer => {
      return pc.setLocalDescription(answer);
    })
    .then(() => {
      this.props.onSendAnswer(this.props.topic.name, this.props.seq, pc.localDescription.toJSON());
    })
    .catch(this.handleGetUserMediaError);
  }

  handleRemoteHangup() {
    this.handleCloseClick();
  }

  stopTracks(el) {
    if (el == null) { return; }
    let stream = el.srcObject;
    if (stream == null) { return; }
    let tracks = stream.getTracks();

    if (tracks != null) {
      tracks.forEach((track) => {
        track.stop();
        track.enabled = false;
        console.log('stopped track ', track.id, track.kind, track.readyState);
      });
    }
    el.srcObject = null;
    el.src = '';
  }

  stop() {
    this.stopTracks(this.localRef.current);
    this.stopTracks(this.remoteRef.current);
    if (this.state.pc != null) {
      this.state.pc.ontrack = null;
      this.state.pc.onremovetrack = null;
      this.state.pc.onremovestream = null;
      this.state.pc.onicecandidate = null;
      this.state.pc.oniceconnectionstatechange = null;
      this.state.pc.onsignalingstatechange = null;
      this.state.pc.onicegatheringstatechange = null;
      this.state.pc.onnegotiationneeded = null;

      this.state.pc.close();
    }
    this.setState({pc: null});
  }

  handleCloseClick() {
    this.stop();
    this.props.onHangup(this.props.topic.name, this.props.seq);
  }

  // Mute/unmute audio/video (specified by kind).
  toggleMedia(kind) {
    const stream = this.state.localStream;
    stream.getTracks().forEach(track => {
      if (track.kind != kind) {
        return;
      }
      console.log('local stream: toggling track ', track.id, track.kind, track.readyState);
      track.enabled = !track.enabled;
    });
    // Make sure we redraw the UI properly.
    this.forceUpdate();
  }

  handleToggleCameraClick() {
    this.toggleMedia('video');
  }

  handleToggleMicClick() {
    this.toggleMedia('audio');
  }

  render() {
    if (!this.props.topic) {
      return null;
    }

    const remoteActive = this.remoteRef.current != null && this.remoteRef.current.srcObject != null;
    const audioIcon = this.state.localStream != null && this.state.localStream.getAudioTracks()[0].enabled ? 'mic' : 'mic_off';
    const videoIcon = this.state.localStream != null && this.state.localStream.getVideoTracks()[0].enabled ? 'videocam' : 'videocam_off';

    return (
      <>
        <div id="topic-caption-panel" className="caption-panel">
          {this.props.displayMobile ?
            <a href="#" id="hide-message-view" onClick={(e) => {e.preventDefault(); this.props.onHideMessagesView();}}>
              <i className="material-icons">arrow_back</i>
            </a>
            :
            null}
          <div className="avatar-box">
            <LetterTile
              tinode={this.props.tinode}
              avatar={this.props.avatar}
              topic={this.props.topic}
              title={this.props.title} />
          </div>
          <div id="topic-title-group">
            <div id="topic-title" className="panel-title">{
              this.props.title ||
              <i><FormattedMessage id="unnamed_topic" defaultMessage="Unnamed"
                description="Title shown when the topic has no name" /></i>
            }</div>
          </div>
        </div>
        <div id="video-container">
          <div className="video-container-panel">
            <div className="video-elem">
              <video id="localVideo" ref={this.localRef} autoPlay muted playsInline></video>
              <div className="video-title">
                <FormattedMessage id="calls_you_label"
                  defaultMessage="You" description="Shown over the local video screen" />
              </div>
            </div>
            <div className="video-elem">
              <video id="remoteVideo" ref={this.remoteRef} autoPlay playsInline></video>
              {remoteActive ?
                <div className="video-title">{clipStr(this.props.title, MAX_TITLE_LENGTH)}</div>
                :
                null}
            </div>
          </div>
          <div id="video-container-controls">
            <button className="video-call-hangup" onClick={this.handleCloseClick}>
              <i className="material-icons">call_end</i>
            </button>
            <button className="video-call-toggle-media" onClick={this.handleToggleCameraClick}><i className="material-icons">{videoIcon}</i></button>
            <button className="video-call-toggle-media" onClick={this.handleToggleMicClick}><i className="material-icons">{audioIcon}</i></button>
          </div>
          <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
        </div>
      </>
    );
  }
};
