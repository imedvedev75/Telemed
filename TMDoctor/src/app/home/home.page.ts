import { Component, ViewChild } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { G } from '../g.service';
import { GVars } from '../gvars.service';
import {jwt} from 'twilio'
import {connect, createLocalVideoTrack, createLocalAudioTrack} from 'twilio-video';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  myStream;
  myConnection;
  public inCall = false;
  offer;
  myName = 'doctor';
  partName = 'patient';
  activeRoom;
  @ViewChild('video', {static:false}) video: any;
  @ViewChild('audio', {static:false}) audio: any;
  @ViewChild('remotemedia', {static:false}) remoteMedia: any;


  constructor(public socket: Socket,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    private g: G,
    public gv: GVars,
    /*private twVideo: Video*/) {}

    ngOnInit() {

      this.diagnostic.requestRuntimePermissions([this.diagnostic.permission.RECORD_AUDIO, this.diagnostic.permission.CAMERA])
        .then((ret) => {
          console.log('requestRuntimePermissions success, ' + JSON.stringify(ret))
        })
        .catch((err) => {
          console.log('requestRuntimePermissions error, ' + JSON.stringify(err))
        });

    if (this.hasUserMedia()) {
      //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
      //|| navigator.mozGetUserMedia || navigator.msGetUserMedia;
      navigator.getUserMedia = navigator.getUserMedia;
      navigator.getUserMedia({ video: true, audio: true }, function (stream) {
        console.log('Stream got');
        this.myStream = stream;
        this.join();
        this.myStream.onremovetrack = function(event) {
          console.log("track removed: " + event.track.kind + ": " + event.track.label);
        };
      }.bind(this), function (err) {
        console.log('getUserMedia error');
        console.log(JSON.stringify(err))
      });
    }
    else {
      console.log('WebRTC NOT supported');
    }
  }

  hasUserMedia() {
    //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
    //   || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia = navigator.getUserMedia;
    //navigator.getUserMedia = navigator.getUserMedia;
    return !!navigator.getUserMedia;
 }

join() {
  this.socket.connect()
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('offer', this.onOffer.bind(this));
  this.socket.on('answer', this.onAnswer.bind(this));
  this.socket.on('candidate', this.onCandidate.bind(this));
  this.socket.on('logged', this.onLogged.bind(this));
  this.socket.on('error', this.onError.bind(this));
  //this.socket.on('connectTo', this.onConnectTo.bind(this));
  this.socket.on('hangup', this.onHangup.bind(this));

  this.socket.emit("login", {"email": this.myName});
}

onConnect() {
  console.log('onConnect');
}

onOffer(message) {
  console.log('onOffer');
  this.offer = message;
  console.log("got offer from id " + message.from);
}

answer() {
  this.createConn(this.partName);
  this.myConnection.setRemoteDescription(new RTCSessionDescription(this.offer.message))
  .then(() => {
      this.myConnection.createAnswer()
          .then(function (answer) {
            this.myConnection.setLocalDescription(answer);
            console.log("sending answer to " + this.partName);
            this.socket.emit("answer", {"from": this.myName, "to": this.partName, "message":answer});
          }.bind(this))
          .catch((err) => {
            console.log(err);
          })
      })
  .catch((error) => {
       alert("oops...error");
  })
}


btnAnswerDisabled() {
  return (null == this.offer) || this.inCall;
}

btnHangupDisabled() {
  return !this.inCall && (null == this.offer);
}


onAnswer(message) {
  console.log("answer from " + message.from);
  this.myConnection.setRemoteDescription(message.message);
}

onCandidate(message) {
  console.log("candidate from " + message.from);
  this.myConnection.addIceCandidate(new RTCIceCandidate(message.message))
    .then((res) => {
      console.log('addIceCandidate success, ' + JSON.stringify(res));
    })
    .catch((err) => {
      console.log('addIceCandidate error, ' + JSON.stringify(err));
    });
}

createConn(peerId) {
  var configuration: any = {
    "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
  };

  //create RTCPeerConnection
  this.myConnection = new webkitRTCPeerConnection(configuration);
  this.myStream.getTracks().forEach(function(track) { this.myConnection.addTrack(track, this.myStream)}.bind(this) );
  this.myConnection["peerId"] = peerId;

  this.myConnection.ontrack = function (e) {
      console.log("stream added");
      this.inCall = true;
      this.video.nativeElement.srcObject = e.streams[0];
      this.audio.nativeElement.srcObject = e.streams[0];
  }.bind(this);

  this.myConnection.onicecandidate = function (event) {
       if (event.candidate) {
          console.log("sending candidate to peer: " + peerId);
          this.socket.emit("candidate", {"from": this.myName, "to": this.partName, "message":event.candidate});
       }
  }.bind(this);

  this.myConnection.oniceconnectionstatechange = function() {
    if ( this.myConnection.iceConnectionState == 'disconnected') {
      console.log('Disconnected');
      this.inCall = false;
      this.myConnection.close();
      this.video.nativeElement.srcObject = null;
      this.audio.nativeElement.srcObject = null;
    }
  }.bind(this);

}

onLogged(message) {
  console.log(message + ', joined');
//  this.myId = message.summonerId;
//  this.checkPeers();
}


onError(error) {
  console.log(error.errorMessage);
}

/*
onConnectTo(message) {
  if (0 == message.peersToConnect.length)
    return;

  var peerId = message.peersToConnect[0];
      
  this.createConn(peerId);

  // create offer and send to peer
  this.myConnection.createOffer()
    .then(function(offer) {
      this.myConnection.setLocalDescription(offer);
      this.socket.emit("offer", {"from": this.myId, "fromName": this.myName, "to": peerId, "message":offer});
      console.log("offer to " + peerId + " sent");
    }.bind(this))
    .catch((err) => {
      console.log('createOffer error, ' + err);
    })
}
*/

hangup() {
  this.stop();  
  this.socket.emit('hangup', {'caller': this.myName, 'recip': this.partName});
}

onHangup(data) {
  this.stop();
}

stop() {
  this.inCall = false;
  if (this.myConnection)
    this.myConnection.close();
  this.offer = null;
  this.video.nativeElement.src = null;
  this.audio.nativeElement.src = null;
}

showVideo() {
  return this.inCall;
}

logout() {
  this.g.post('/logout', {});
}

async answerTwilio() {
  var accessToken = new jwt.AccessToken('...', '...', 
    '...', {identity: 'doctor'});
  //accessToken.
  var VideoGrant = jwt.AccessToken.VideoGrant;
  const videoGrant = new VideoGrant();
  accessToken.addGrant(videoGrant);
  console.log(accessToken.toJwt());

  var connectOptions = {
    name: '2',
    tracks: [await createLocalVideoTrack(), await createLocalAudioTrack()]
  };

  //var twVideo = new Video();
  connect(accessToken.toJwt(), connectOptions).then(this.roomJoined.bind(this), function(error) {
    console.log('Could not connect to Twilio: ' + error.message);
  });

}

hangupTwilio() {
  if (this.activeRoom) {
    this.activeRoom.disconnect();
  }
}

trackPublished(publication, participant) {
  console.log(`RemoteParticipant ${participant.identity} published a RemoteTrack: ${publication}`);
  //this.attachTracks([publication.track], this.remoteMedia.nativeElement);
  //assert(!publication.isSubscribed);
  //assert.equal(publication.track, null);

  publication.on('subscribed', track => {
    console.log(`LocalParticipant subscribed to a RemoteTrack: ${track}`);
    this.attachTracks([track], this.remoteMedia.nativeElement);
    //assert(publication.isSubscribed);
    //assert(publication.track, track);
  });

  publication.on('unsubscribed', track => {
    console.log(`LocalParticipant unsubscribed from a RemoteTrack: ${track}`);
    this.detachTracks([track]);
    //assert(!publication.isSubscribed);
    //assert.equal(publication.track, null);
  });
}

participantConnected(participant) {
  participant.tracks.forEach(function(publication) {
    this.trackPublished(publication, participant);
  }.bind(this));

  participant.on('trackPublished', function(publication) {
    this.trackPublished(publication, participant);
  }.bind(this));

  participant.on('trackUnpublished', publication => {
    console.log(`RemoteParticipant ${participant.identity} unpublished a RemoteTrack: ${publication}`);
  });
}

roomJoined(room) {
  this.activeRoom = room;

  room.localParticipant.tracks.forEach(function trackPublished(publication) {
    console.log(`Published LocalTrack: ${publication.track}`);
  });

  //this.attachParticipantTracks(room.localParticipant, null);

 // Attach the Tracks of the Room's Participants.
 room.participants.forEach(this.participantConnected.bind(this));
 /*
 room.participants.forEach(function(participant) {
  console.log("Already in Room: '" + participant.identity + "'");
  var previewContainer = this.remoteMedia.nativeElement;
  this.attachParticipantTracks(participant, previewContainer);
}.bind(this));
*/

// When a Participant joins the Room, log the event.
room.on('participantConnected', this.participantConnected.bind(this));
/*
room.on('participantConnected', function(participant, previewContainer) {
  console.log("Joining: '" + participant.identity + "'");
  participant.on('trackPublished', publication => {
    console.log(`RemoteParticipant ${participant.identity} published a RemoteTrack: ${publication}`);
  
    publication.on('subscribed', track => {
      console.log(`LocalParticipant subscribed to a RemoteTrack: ${track}`);
      this.attachTracks([track], previewContainer);
      //assert(publication.isSubscribed);
      //assert(publication.track, track);
    });
  });
});
*/

// When a Participant adds a Track, attach it to the DOM.
room.on('trackAdded', function(track, participant) {
  console.log(participant.identity + " added track: " + track.kind);
  var previewContainer = this.remoteMedia.nativeElement;
  this.attachTracks([track], previewContainer);
}.bind(this));

// When a Participant removes a Track, detach it from the DOM.
room.on('trackRemoved', function(track, participant) {
  console.log(participant.identity + " removed track: " + track.kind);
  this.detachTracks([track]);
}.bind(this));

// When a Participant leaves the Room, detach its Tracks.
room.on('participantDisconnected', function(participant) {
  console.log("Participant '" + participant.identity + "' left the room");
  this.detachParticipantTracks(participant);
}.bind(this));

// Once the LocalParticipant leaves the room, detach the Tracks
// of all Participants, including that of the LocalParticipant.
room.on('disconnected', function() {
  console.log('Left');
  this.detachParticipantTracks(room.localParticipant);
  room.participants.forEach(this.detachParticipantTracks.bind(this));
  this.activeRoom = null;
}.bind(this));
}

// Attach the Tracks to the DOM.
attachTracks(tracks, container) {
  tracks.forEach(function(track) {
    //if (track.track) {
      var ret = track.attach();
      if (container)
        container.appendChild(ret);
    //}
  });
}

// Attach the Participant's Tracks to the DOM.
attachParticipantTracks(participant, container) {
  var tracks = Array.from(participant._tracks.values());
  this.attachTracks(tracks, container);
}

// Detach the Tracks from the DOM.
detachTracks(tracks) {
  tracks.forEach(function(track) {
    //if (track.track)
      track.detach().forEach(function(detachedElement) {
        detachedElement.remove();
      });
  });
}

// Detach the Participant's Tracks from the DOM.
detachParticipantTracks(participant) {
  var tracks = Array.from(participant._tracks.values());
  this.detachTracks(tracks);
}


conversationStarted(conversation) {
  //Write code to handle the conversation here
}

onInviteAccepted(conversation) {
    conversation.on('participantConnected', function(participant) {
    participant.media.attach('#remote');

    this.conversationStarted(conversation);
  });

}

}