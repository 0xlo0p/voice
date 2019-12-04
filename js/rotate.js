var timer = null; //全局命名定时器的名字
var img; //全局命名img
var r = 0; //全局命名角度
var states = null;
var rec;
var guid = uuid();

function uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";
	var uuid = s.join("");
	return uuid;
}

function imgClick() {
	if (flag) {
		clearInterval(timer);
		img.style.transform = "rotate(0deg)";
		img.style.transition = "all 0s linear";
		console.log("定时器已停止");
		flag = false;
	} else if (flag == false) {
		timer = setInterval(() => {
			img.style.transform = "rotateX(" + (r += 20) + "deg)";
			img.style.transition = "all 1s linear";
			console.log("定时器启动");
		}, 500);
		flag = true;
	}
};

function record_click() {
	if (states == null) {
		clearInterval(timer);
		img.style.transform = "rotate(0deg)";
		img.style.transition = "all 0s linear";
		console.log("定时器已停止");
		flag = false;
		rec = Recorder({
			type: "mp3",
			sampleRate: 16000, //采样频率，默认为44100Hz(标准MP3采样率)
			bitRate: 16, //比特率，默认为128kbps(标准MP3质量)
			onProcess: function(buffers, powerLevel, bufferDuration, bufferSampleRate) {
				console.log(bufferDuration);
			},
			success: function() { //成功回调函数
				// start.disabled = false;
			},
			error: function(msg) { //失败回调函数
				alert(msg);
			},
			fix: function(msg) { //不支持H5录音回调函数
				alert(msg);
			}
		});
		//使用默认配置，mp3格式  //打开麦克风授权获得相关资源
		rec.open(
			function() {
				rec.start();
				states = 'record';
				console.log("start");
			},
			function(msg, isUserNotAllow) {
				//用户拒绝了权限或浏览器不支持
				alert((isUserNotAllow ? "用户拒绝了权限，" : "") + "无法录音:" + msg);
			}
		);

	} else if (states == "record") {
		alert('当前录音中');
	} else if (states == "reverse") {
		alert('当前处理音频中');
	} else if (states == "play") {
		alert('当前播放中');
	}

}

function upload_click() {
	rec.stop(function(blob, duration) {
		rec.close();
		rec = null;
		var audio = document.createElement("audio");
		audio.controls = true;
		document.body.appendChild(audio);
		//简单的一哔，注意不用了时需要revokeObjectURL，否则霸占内存
		audio.src = (window.URL || webkitURL).createObjectURL(blob);
		audio.play();
		/*
		blob文件对象，可以用FileReader读取出内容
		，或者用FormData上传，本例直接上传二进制文件
		，对于普通application/x-www-form-urlencoded表单上传
		，请参考github里面的例子
		*/
		console.log(blob, (window.URL || webkitURL).createObjectURL(blob), "时长:" + duration + "ms");
		var form = new FormData();
		form.append("uuid", guid);
		form.append("upfile", blob, "recorder.mp3"); //和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3  //直接用ajax上传
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/upload"); //这个假地址在控制台network中能看到请求数据和格式，请求结果无关紧要
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				alert(xhr.status == 200 ? "音源反转中,请等待10-20s" : "测试请先打开浏览器控制台，然后重新录音，在network选项卡里面就能看到上传请求数据和格式了");
			}
		}
		xhr.send(form);

	}, function(msg) {
		alert("录音失败:" + msg);
		rec.close();
	});

};

window.onload = function() {
	//页面一启动就加载

	img = document.getElementById("micro");

	timer = setInterval(() => {
		img.style.transform = "rotateX(" + (r += 20) + "deg)"; //用css的转换属性
		img.style.transition = "all 1s linear"; //用css的过度属性，注意 时间需要和定时器启动的时间一致才能不卡帧,不要linear会一顿一顿的
		console.log("定时器启动");
	}, 500);

	var is_left = false;
	var is_right = false;
	setInterval(function() {
		var left_pos = parseInt(document.getElementById('left').style.left);
		var right_pos = parseInt(document.getElementById('right').style.right);
		var windows_width = parseInt(document.body.clientWidth);
		if (left_pos > 300) {
			is_left = true;
		} else if (left_pos <= 0) {
			is_left = false;
		}
		if (right_pos > 300) {
			is_right = true
		} else if (right_pos <= 0) {
			is_right = false
		}

		if (!is_left) {
			document.getElementById('left').style.left = left_pos + 20 + "px";
		} else {
			document.getElementById('left').style.left = left_pos - 20 + "px";
		}

		if (!is_right) {
			document.getElementById('right').style.right = right_pos + 20 + "px";
		} else {
			document.getElementById('right').style.right = right_pos - 20 + "px";
		}
	}, 100);
	setInterval(function() {
		var Lb = false;
		var Ub = false;

		function rotate(obj) {
			if (obj == "L") {

				if (Lb == false) { //第一次
					document.getElementById("micro").classList.add("flipx");
				} else {
					document.getElementById("micro").classList.remove("flipx");
				}
				Lb = !Lb;
			}
			if (obj == "U") {

				if (Ub == false) { //第一次
					document.getElementById("micro").classList.add("flipy");
				} else {
					document.getElementById("micro").classList.remove("flipy");
				}
				Ub = !Ub;
			}
		}
	}, 1000);
};

var flag = true; //全局声明状态切换的初始值
