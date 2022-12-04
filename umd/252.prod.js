"use strict";(globalThis.webpackChunktinode_webapp=globalThis.webpackChunktinode_webapp||[]).push([[252],{252:(e,t,i)=>{i.r(t),i.d(t,{default:()=>m});var s=i(363),a=i.n(s),n=i(861),r=i(246),h=i.n(r),o=i(405),l=i(905),d=i(962);const c=100,u="audio/webm";class m extends a().PureComponent{constructor(e){super(e),this.state={enabled:!0,audioRecord:null,recording:!0,paused:!1,duration:"0:00",blobUrl:null,preview:null},this.visualize=this.visualize.bind(this),this.initMediaRecording=this.initMediaRecording.bind(this),this.initCanvas=this.initCanvas.bind(this),this.getRecording=this.getRecording.bind(this),this.cleanUp=this.cleanUp.bind(this),this.handleResume=this.handleResume.bind(this),this.handlePause=this.handlePause.bind(this),this.handleDelete=this.handleDelete.bind(this),this.handleDone=this.handleDone.bind(this),this.durationMillis=0,this.startedOn=null,this.viewBuffer=[],this.canvasRef=a().createRef()}componentDidMount(){this.stream=null,this.mediaRecorder=null,this.audioContext=null,this.audioInput=null,this.analyser=null,this.audioChunks=[];try{navigator.mediaDevices.getUserMedia({audio:!0,video:!1}).then(this.initMediaRecording,this.props.onError)}catch(e){this.props.onError(e)}}componentWillUnmount(){this.startedOn=null,this.stream&&this.cleanUp()}visualize(){this.initCanvas();const e=new Uint8Array(this.analyser.frequencyBinCount),t=this.canvasWidth,i=this.canvasHeight,s=t/10|0,a=c*s;this.canvasContext.lineWidth=6,this.canvasContext.strokeStyle="#BBBD";let n=0,r=0,h=0;const o=u=>{if(!this.startedOn)return;window.requestAnimationFrame(o);const m=this.durationMillis+(Date.now()-this.startedOn);this.setState({duration:(0,l.nH)(m/1e3)}),m>d.Zf&&(this.startedOn=null,this.mediaRecorder.pause(),this.durationMillis+=Date.now()-this.startedOn,this.setState({enabled:!1,recording:!1,duration:(0,l.nH)(this.durationMillis/1e3)})),this.analyser.getByteTimeDomainData(e);let v=0;for(const t of e)v+=(t-127)**2;r+=Math.sqrt(v/e.length),h++;let p=m/c|0;const f=a>m?0:(m-c*p)/c*10;n!=p&&(n=p,this.viewBuffer.push(r/h),r=0,h=0,this.viewBuffer.length>s&&this.viewBuffer.shift()),this.canvasContext.clearRect(0,0,t,i),this.canvasContext.beginPath();for(let e=0;e<this.viewBuffer.length;e++){let t=10*e-f,s=Math.min(this.viewBuffer[e]/64,.9)*i;this.canvasContext.moveTo(t,.5*(i-s)),this.canvasContext.lineTo(t,.5*i+.5*s)}this.canvasContext.stroke()};o()}handlePause(e){e.preventDefault(),this.mediaRecorder.pause(),this.mediaRecorder.requestData(),this.durationMillis+=Date.now()-this.startedOn,this.startedOn=null,this.setState({recording:!1})}handleResume(e){e.preventDefault(),this.state.enabled&&(this.startedOn=Date.now(),this.mediaRecorder.resume(),this.setState({recording:!0},this.visualize))}handleDelete(e){e.preventDefault(),this.durationMillis=0,this.startedOn=null,this.mediaRecorder.stop(),this.cleanUp(),this.setState({recording:!1})}handleDone(e){e.preventDefault(),this.setState({recording:!1}),this.startedOn&&(this.durationMillis+=Date.now()-this.startedOn,this.startedOn=null),this.mediaRecorder&&this.mediaRecorder.stop()}initCanvas(){this.canvasRef.current.width=2*this.canvasRef.current.offsetWidth,this.canvasRef.current.height=2*this.canvasRef.current.offsetHeight,this.canvasContext=this.canvasRef.current.getContext("2d"),this.canvasContext.lineCap="round",this.canvasContext.translate(.5,.5),this.canvasWidth=this.canvasRef.current.width,this.canvasHeight=this.canvasRef.current.height}initMediaRecording(e){this.stream=e,this.mediaRecorder=new MediaRecorder(e,{mimeType:u,audioBitsPerSecond:24e3}),this.audioContext=new AudioContext,this.audioInput=this.audioContext.createMediaStreamSource(e),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.audioInput.connect(this.analyser),this.mediaRecorder.onstop=e=>{this.durationMillis>d.rX?this.getRecording(this.mediaRecorder.mimeType,this.durationMillis).then((e=>this.props.onFinished(e.url,e.preview,this.durationMillis))):this.props.onDeleted(),this.cleanUp()},this.mediaRecorder.ondataavailable=e=>{e.data.size>0&&this.audioChunks.push(e.data),"inactive"!=this.mediaRecorder.state&&this.getRecording(this.mediaRecorder.mimeType).then((e=>{this.setState({blobUrl:e.url,preview:e.preview})}))},this.durationMillis=0,this.startedOn=Date.now(),this.mediaRecorder.start(),this.visualize()}getRecording(e,t){e=e||u;let i=new Blob(this.audioChunks,{type:e});return h()(i,e).then((e=>(i=e,e.arrayBuffer()))).then((e=>this.audioContext.decodeAudioData(e))).then((e=>this.createPreview(e))).then((e=>({url:window.URL.createObjectURL(i),preview:(0,o.JG)(e)})))}createPreview(e){const t=e.getChannelData(0),i=Math.min(t.length,96),s=t.length/i|0,a=Math.max(1,s/10|0);let n=[],r=-1;for(let e=0;e<i;e++){let i=0,h=0;for(let n=0;n<s;n+=a)i+=t[s*e+n]**2,h++;const o=Math.sqrt(i/h);n.push(o),r=Math.max(r,o)}return r>0&&(n=n.map((e=>100*e/r|0))),n}cleanUp(){this.audioInput.disconnect(),this.stream.getTracks().forEach((e=>e.stop()))}render(){const e="material-icons "+(this.state.enabled?"red":"gray");return a().createElement("div",{className:"audio"},a().createElement("a",{href:"#",onClick:this.handleDelete,title:"Delete"},a().createElement("i",{className:"material-icons gray"},"delete_outline")),this.state.recording?a().createElement("canvas",{ref:this.canvasRef}):a().createElement(n.Z,{src:this.state.blobUrl,preview:this.state.preview,duration:this.durationMillis,short:!0}),a().createElement("div",{className:"duration"},this.state.duration),this.state.recording?a().createElement("a",{href:"#",onClick:this.handlePause,title:"Pause"},a().createElement("i",{className:"material-icons"},"pause_circle_outline")):a().createElement("a",{href:"#",onClick:this.handleResume,title:"Resume"},a().createElement("i",{className:e},"radio_button_checked")),a().createElement("a",{href:"#",onClick:this.handleDone,title:"Send"},a().createElement("i",{className:"material-icons"},"send")))}}}}]);
//# sourceMappingURL=252.prod.js.map