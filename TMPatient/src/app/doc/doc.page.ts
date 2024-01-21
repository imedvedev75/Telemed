import { Component, OnInit, ViewChild } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { SERVER_URL } from 'src/environments/environment';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { G } from '../g.service';
import { GVars } from '../gvars.service';
import {jwt} from 'twilio'
import {connect, createLocalVideoTrack, createLocalAudioTrack} from 'twilio-video';


@Component({
  selector: 'app-doc',
  templateUrl: './doc.page.html',
  styleUrls: ['./doc.page.scss'],
})
export class DocPage implements OnInit {

  public message;
  myStream;
  remoteStream;
  //myAudioStream;
  //myVideoStream;
  //remoteAudioStream;
  //remoteVideoStream;  
  myConnection;
  inCall: boolean = true;
  activeRoom;
  myName = 'patient';
  partName = 'doctor';
  @ViewChild('videoRemote', {static:false}) videoRemote: any;
  @ViewChild('audioRemote', {static:false}) audioRemote: any;
  @ViewChild('videoLocal', {static:false}) videoLocal: any;
  //@ViewChild('audioLocal', {static:false}) audioLocal: any;
  @ViewChild('remotemedia', {static:false}) remoteMedia: any;
  @ViewChild('localmedia', {static:false}) localMedia: any;


  constructor(
    public socket: Socket,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    public g: G,
    public gv: GVars
  ) { }

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
      navigator.getUserMedia({ video: true , audio: true }, function (stream) {
        console.log('Stream got');
        this.myStream = stream;
        //this.myAudioStream = new MediaStream(stream.getAudioTracks());
        //this.myVideoStream = new MediaStream(stream.getVideoTracks());
        this.setup();
        this.myStream.onremovetrack = function(event) {
          console.log("audio track removed: " + event.track.kind + ": " + event.track.label);
        };
        /*
        this.myAudioStream.onremovetrack = function(event) {
          console.log("audio track removed: " + event.track.kind + ": " + event.track.label);
        };
        this.myVideoStream.onremovetrack = function(event) {
          console.log("video track removed: " + event.track.kind + ": " + event.track.label);
        };
        */
      }.bind(this), function (err) {
        console.log('getUserMedia error');
        console.log(JSON.stringify(err))
      });
    }
    else {
      this.message = 'WebRTC NOT supported';
    }
  }

  hasUserMedia() {
    //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
    //   || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia = navigator.getUserMedia;
    //navigator.getUserMedia = navigator.getUserMedia;
    return !!navigator.getUserMedia;
 }

setup() {
  this.socket.connect()
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('offer', this.onOffer.bind(this));
  this.socket.on('answer', this.onAnswer.bind(this));
  this.socket.on('candidate', this.onCandidate.bind(this));
  this.socket.on('logged', this.onLogged.bind(this));
  this.socket.on('error', this.onError.bind(this));
  this.socket.on('hangup', this.onHangup.bind(this));
  this.socket.on('connectTo', this.onConnectTo.bind(this));

  this.socket.emit("login", {"email": this.gv.loggedEMail});
}

join() {
  this.videoLocal.nativeElement.srcObject = new MediaStream(this.myStream.getVideoTracks());
  //this.audioLocal.nativeElement.srcObject = this.myStream;

  this.createConn(this.partName);

  this.socket.emit("join", {"email": this.gv.loggedEMail, 'room': this.g.gv.doc.email});
}

call() {
  this.createConn(this.partName);
  
  // create offer and send to peer
  this.myConnection.createOffer()
    .then(function(offer) {
      this.myConnection.setLocalDescription(offer);
      this.socket.emit("offer", {"from": this.myName, "to": this.partName, "message":offer});
      console.log("offer to " + this.partName + " sent");
    }.bind(this))
    .catch((err) => {
      console.log('createOffer error, ' + err);
    })
}

onConnect() {
  console.log('onConnect');
}

onOffer(message) {
  console.log('onOffer');
  var peerId = message.from;
  console.log("got offer from id " + peerId);
  this.createConn(peerId);
  this.myConnection.setRemoteDescription(new RTCSessionDescription(message.message))
  .then(() => {
      this.myConnection.createAnswer()
          .then(function (answer) {
            this.myConnection.setLocalDescription(answer);
            console.log("sending answer to " + peerId);
            this.socket.emit("answer", {"from": this.gv.loggedEMail, "to": peerId, "message":answer});
          }.bind(this))
          .catch((err) => {
            console.log(err);
          })
      })
  .catch((error) => {
       alert("oops...error");
  })
}

onAnswer(message) {
  console.log("answer from " + message.from);
  this.myConnection['candidates'].forEach(function (candidate) {
    this.socket.emit("candidate", {"from": this.gv.loggedEMail, "to": message.from, "message": candidate});
    console.log("sending candidate to peer: " + message.from);
  }.bind(this));
  setTimeout(function() {
    this.myConnection.setRemoteDescription(message.message);
  }.bind(this), 1000);
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
    "iceServers": [{ "url": "stun:stun.1.google.com:19302" }, 
    {'urls': 'turn:192.158.29.39:3478?transport=udp',
    'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    'username': '28224511:1379330808'}]
  };

  //create RTCPeerConnection
  this.myConnection = new webkitRTCPeerConnection(configuration);
  this.myStream.getTracks().forEach(function(track) { 
    this.myConnection.addTrack(track, this.myStream)
  }.bind(this) );
  //this.myVideoStream.getTracks().forEach(function(track) { this.myConnection.addTrack(track)}.bind(this) );
  //this.myAudioStream.getTracks().forEach(function(track) { this.myConnection.addTrack(track)}.bind(this) );
  this.myConnection["peerId"] = peerId;
  this.myConnection["candidates"] = [];

  this.myConnection.ontrack = function (e) {
        console.log('remote stream arrived: ');
        //if ('video' == e.track.kind) {
          //console.log('remote video track')
          e.track.onunmute = function() {
            console.log('track unmuted');
            this.videoRemote.nativeElement.srcObject = e.streams[0];
          }.bind(this);
          //this.videoRemote.nativeElement.srcObject = new MediaStream(e.streams[0].getVideoTracks());
        //}
      /*
      if (stream.getVideoTracks().length > 0) {
        console.log("remote video stream arrived");
        //this.videoRemote.nativeElement.srcObject = stream;  //new MediaStream(stream.getVideoTracks());
        this.remoteVideoStream = stream;
        setTimeout(function() {
          console.log("remote video stream added");
          this.videoRemote.nativeElement.srcObject = this.remoteVideoStream;
        }.bind(this), 3000)
      }
      else {
        console.log("remote audio stream arrived");
        //this.audioRemote.nativeElement.srcObject = new MediaStream(stream.getAudioTracks());
        this.remoteAudioStream = stream;
      }
      */
      //this.audioRemote.nativeElement.srcObject = e.streams[0];
      this.inCall = true;
  }.bind(this);

  this.myConnection.onicecandidate = function (event) {
    console.log('onicecandidate: ' + JSON.stringify(event));
    if (event.candidate) {
      //console.log("sending candidate to peer: " + peerId);
      //this.socket.emit("candidate", {"from": this.myId, "to": peerId, "message":event.candidate});
      this.myConnection["candidates"].push(event.candidate);
    }
  }.bind(this);

  this.myConnection.oniceconnectionstatechange = function() {
    console.log('ICE state: ' + this.myConnection.iceConnectionState);
    if ( this.myConnection.iceConnectionState == 'disconnected') {
      console.log('Disconnected');
      this.myConnection.close();
    }
  }.bind(this);
}

getFreeVideo(peerId) {
  var list = document.getElementById('videosList');
  var div = document.createElement('div');
  var video = document.createElement('audio');
  var caption = document.createElement('label');
  caption.innerHTML = peerId;
  div.appendChild(caption);
  div.appendChild(document.createElement("br"));
  div.appendChild(video);
  video.autoplay = true;
  //video.width = 200;
  //video.height = 200;
  video.controls = true;
  list.appendChild(div);
  return video;
}

onLogged(message) {
  console.log("joined " + JSON.stringify(message));
}


onError(error) {
  this.message = error.errorMessage;
}


onConnectTo(message) {
  console.log('onConnectTo' + JSON.stringify(message));
  
  if (0 == message.peersToConnect.length)
    return;

  var peerId = message.peersToConnect[0];
      
  //this.createConn(peerId);

  // create offer and send to peer
  this.myConnection.createOffer()
    .then(function(offer) {
      this.myConnection.setLocalDescription(offer);
      this.socket.emit("offer", {"from": this.gv.loggedEMail, "to": peerId, "message":offer});
      console.log("offer to " + peerId + " sent");
    }.bind(this))
    .catch((err) => {
      console.log('createOffer error, ' + err);
    })
}

/*
logout() {
  this.message = "not joined";
  this.socket.emit("logout", {"myId": this.myId});
  this.stop();
}
*/

hangup() {
  this.inCall = false;
  if (this.myConnection)
    this.myConnection.close();
  this.videoRemote.nativeElement.srcObject = null;
  this.audioRemote.nativeElement.srcObject = null;
  this.videoLocal.nativeElement.srcObject = null;
  //this.audioLocal.nativeElement.srcObject = null;
  this.socket.emit('hangup', {'from': this.gv.loggedEMail, 'room': this.gv.doc.email});
}

onHangup(data) {
  this.inCall = false;
  console.log('onHangup ' + JSON.stringify(data));
  this.videoRemote.nativeElement.srcObject = null;
  this.audioRemote.nativeElement.srcObject = null;
}

/*
stop() {
  this.inCall = false;
  if (this.myConnection)
    this.myConnection.close();
  this.videoRemote.nativeElement.srcObject = null;
  this.audioRemote.nativeElement.srcObject = null;
  this.videoLocal.nativeElement.srcObject = null;
  this.audioLocal.nativeElement.srcObject = null;
}
*/

showVideo() {
  return this.inCall;
}
 

async callTwilio() {
  var accessToken = new jwt.AccessToken('...', '...', 
    '...', {identity: this.gv.loggedEMail});
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
  this.attachTracks([publication.track], this.remoteMedia.nativeElement);
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

  // Attach LocalParticipant's Tracks, if not already attached.
  this.attachParticipantTracks(room.localParticipant, this.localMedia.nativeElement);

 // Attach the Tracks of the Room's Participants.
 room.participants.forEach(this.participantConnected.bind(this));

 room.participants.forEach(function(participant) {
  console.log("Already in Room: '" + participant.identity + "'");
  var previewContainer = this.remoteMedia.nativeElement;
  this.attachParticipantTracks(participant, previewContainer);
}.bind(this));


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
});

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
  //activeRoom = null;
}.bind(this));
}

// Attach the Tracks to the DOM.
attachTracks(tracks, container) {
  tracks.forEach(function(track) {
    if (track) {
      var ret = track.attach();
      ret.style.maxWidth = '100%';
      if (container)
        container.appendChild(ret);
    }
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



}
