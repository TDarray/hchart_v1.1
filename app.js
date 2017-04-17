var express=require('express');
var app=express();
var net=require('net');
var http=require('http').createServer(app);
var io=require('socket.io')(http);
var os=require('os');

//��EventEmitter����������
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
//������socket
var nodeServer = new net.Socket();
var client = new net.Socket();
//ÿ�ν��յ����ݳ���,����Э��䶯�ɸ���
const len = 4027;
//д�����
var offset=4;//ƫ��ֵ
var dataNum=0;//���յ���
//����ʹ��
var haha=0;
// �洢�ͻ��˵�WebSocket����ʵ��
var aSocket = null;//(Ŀǰֻ��һ��һ�������������󣬿���io.emit?)
var useData = null;
//����������������8888�˿ڣ�ʡ��127.0.0.1��
var server = http.listen(8888,function () {

  var host = server.address().address
  var port = server.address().port

  console.log("welcome to http://%s:%s", host, port)

});
ee.setMaxListeners(10);
app.use(express.static('public'));
app.get('/',function(req,res){

  res.sendfile(__dirname+'/starter.html');
});

// ͬ�ͻ��˽�������
io.on('connection', function (socketIO) {
  aSocket=socketIO;
  // �����ã����ӳɹ�
  socketIO.emit("test","your websocket has connected");
  //��������ʹ�ã�����C������
  socketIO.on('fromWebClient', function (webClientData) {
    console.log(webClientData);
    var head=new Buffer([0xAA,0x01,0x11,0x11,0x11,0x11]);
    var cmdData=new Buffer(webClientData);
    var cmdControl=Buffer.concat([head,cmdData]);
    console.log(cmdControl);
    client.write(cmdControl);
  });
  socketIO.on('fromCmd',function(CmdData){

    var IPaddr=CmdData.IPaddr;
    var CmdPort=parseFloat(CmdData.CmdPort);
    var DataPort=parseFloat(CmdData.DataPort);
    connectDPort(DataPort,IPaddr);
    connectCPort(CmdPort,IPaddr);

  })
  socketIO.on('disconnect', function () {
    console.log('DISCONNECTED FROM IO');
  });
});

// ��C��������������
nodeServer.on('data', function (data) {
  //����������ݵ�һλΪ0xAA(��ӦֵΪ170)�����ݳ�Ϊlen
  if(data.readUInt8(0)==170&&data.length==len){
    dataNum=data.readInt32LE(6);
    console.log('>> nodeServer receive data.length:'+data.length);
    haha++;
    console.log("receive times"+haha);
    console.log('free mem : ' + Math.ceil(os.freemem()/(1024*1024)) + 'mb');
    useData=byteArrayUntil.getUseJson(data,offset);
    //��ͻ��˷���json����
    //�ж�websocket�Ƿ��Ѿ�����
    if(aSocket!=null){
      aSocket.emit('pushToWebClient',useData);
    }
    console.log('nodeServer data length'+data.length);

  }
});

//���ӵ�C������DataPort�˿�
function connectDPort(DataPort,IPaddr){
  nodeServer.connect(DataPort, IPaddr, function() {
    console.log('CONNECTED TO:',IPaddr,DataPort);
    // �������Ӻ�������������������ݣ����������յ���Щ����
    var receive = new Buffer([0xAA,0x02,0xFE]);
    nodeServer.write(receive);
    //nodeServer.write('your'+ DataPort +'socket has connected');
  });
  nodeServer.on('error',function(err){
    console.error(err);
  })
}

//���ӵ�C������CmdPort�˿�
function connectCPort(CmdPort,IPaddr){
  client.connect(CmdPort, IPaddr, function() {
    console.log('CONNECTED TO:',IPaddr,CmdPort);
  });
  client.on('error',function(err){
    console.error(err);
  })
}
//����һ����������,�ֱ𷵻�array����json
var byteArrayUntil=new function(){
  this.getUseData=function(data,offset){
    var arr=[];
    for(var i=0;i<dataNum;i++){
      arr.push(data.readInt32LE(826+i*offset));
    }
    return arr;
  }
  this.getUseJson=function(data,offset){
    var arr1=[];
    var arr2=[];
    for(var i=0;i<dataNum;i++){
      arr1.push((data.readInt32LE(826+i*offset))/1000);
    }
    var low=parseInt(data.readInt32LE(14)/1000);
    var high=parseInt(data.readInt32LE(18)/1000);
    var off=(high-low)/dataNum;//�üӺſ��Խ��ĵ���string����ת��Ϊnumber����
    for(var k=low;k<=high;k=k+off) {
      arr2.push(k.toFixed(2));
    }

    return {'dbm':arr1,//arr1��ֵ����Ϊ�ַ���������hchart��ʾ����
      'hz':arr2};//arr2ͬ��
  }

}();