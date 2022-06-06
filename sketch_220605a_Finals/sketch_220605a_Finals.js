// 음성 인식된 단어의 그림이 얼굴에 그려진다. 손으로 얼굴을 스치면 그림이 바뀐다.
// 0511, 0523, 0530
// sketchRNN
let model;
let previous_pen = 'down';
let x, y;
let strokePath;
let recSpeak;
let text = [];

// facemash
let facemesh;
let video;
let predictions = [];
var xx =0; var yy=0;

// posenet
let poseNet;
let poses = [];
var wristX; var wristY;

function preload(){
  model = ml5.sketchRNN('cat');   // 기본 고양이
}

function setup() {
  createCanvas(640, 480);
  background(220);
  
  // video setting
  video = createCapture(VIDEO);
  video.size(width, height);
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on("predict", results => {
    predictions = results;   // 예측 결과
  });
  video.hide();   // html 상 비디오 지우기
  
  // 음성 인식 세팅
  recSpeak = new p5.SpeechRec('en-US', results);
  recSpeak.start(true, false);
  let button = createButton('clear');
  button.mousePressed(startDrawing);   // 얼굴에 손이 스칠 때 startDrawing
  
  //PoseNet
  poseNet = ml5.poseNet(video);
  poseNet.on("pose", function(results){
    poses = results;
  });
}

function modelReady(){
  console.log('model loaded');   // 온라인에서 불러오기 완료 표시
}

function startDrawing(){
  background(220);
  //x = width/2;
  //y = height/2;
  // 얼굴 위
  x = xx;
  y = yy;
  model.reset();
  model.generate(gotStroke);
}

function draw() {
  image(video, 0, 0, width, height);   // 얘가 가리는 것 같은데...
  drawKeypoints();
  
  if(strokePath){
    if(previous_pen == 'down'){
      stroke(0);
      strokeWeight(3.0);
      line(x, y, x+strokePath.dx, y+strokePath.dy);
    }
    x += strokePath.dx;
    y += strokePath.dy;
    previous_pen = strokePath.pen;
    if(strokePath.pen != 'end'){
      strokePath = null;
      model.generate(gotStroke);
    }
  }
}

function gotStroke(err, s){
  strokePath = s;
}

// 음성 인식 결과 로그 출력
function results(){
  if(recSpeak.resultValue){
    text = recSpeak.resultString.toLowerCase().split(".");
    model = ml5.sketchRNN(text[0]);
    console.log("You said \"" + text[0] + "\"");   // .을 기준으로 분리한 문자열
  }
}

function drawKeypoints(){
  // PoseNet
  for(let i=0; i<poses.length; i++) {
    for(var j=0; j<chars.length; j++){
      const pose = poses[i].pose;
      const keypoint = pose.keypoints[10];     // 오른팔 손목
      wristX = keypoint.position.x;
      wristY = keypoint.position.y;
    }
  }
  
  // FaceMash
  for(let i=0; i<predictions.length; i++){
      const keypoints = predictions[i].scaledMesh;
      for(let j = 0; j<keypoints.length; j++){
        const[x, y] = keypoints[171];
        xx=x;
        yy=y;
      }
  }
}
