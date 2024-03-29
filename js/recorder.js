/*
录音
https://github.com/xiangyuecn/Recorder
src: recorder-core.js,engine/mp3.js,engine/mp3-engine.js
*/
! function(h) {
	"use strict";
	var u = function() {},
		A = function(e) {
			return new t(e)
		};
	A.IsOpen = function() {
		var e = A.Stream;
		if (e) {
			var t = e.getTracks && e.getTracks() || e.audioTracks || [],
				a = t[0];
			if (a) {
				var s = a.readyState;
				return "live" == s || s == a.LIVE
			}
		}
		return !1
	}, A.BufferSize = 4096, A.Destroy = function() {
		for (var e in console.log("Recorder Destroy"), a) a[e]()
	};
	var a = {};
	A.BindDestroy = function(e, t) {
		a[e] = t
	}, A.Support = function() {
		var e = h.AudioContext;
		if (e || (e = h.webkitAudioContext), !e) return !1;
		var t = navigator.mediaDevices || {};
		return t.getUserMedia || (t = navigator).getUserMedia || (t.getUserMedia = t.webkitGetUserMedia || t.mozGetUserMedia ||
			t.msGetUserMedia), !!t.getUserMedia && (A.Scope = t, A.Ctx && "closed" != A.Ctx.state || (A.Ctx = new e, A.BindDestroy(
			"Ctx",
			function() {
				var e = A.Ctx;
				e && e.close && e.close()
			})), !0)
	}, A.SampleData = function(e, t, a, s, n) {
		s || (s = {});
		var r = s.index || 0,
			i = s.offset || 0,
			_ = s.frameNext || [];
		n || (n = {});
		var o = n.frameSize || 1;
		n.frameType && (o = "mp3" == n.frameType ? 1152 : 1);
		for (var l = 0, f = r; f < e.length; f++) l += e[f].length;
		l = Math.max(0, l - Math.floor(i));
		var c = t / a;
		1 < c ? l = Math.floor(l / c) : (c = 1, a = t), l += _.length;
		for (var h = new Int16Array(l), u = 0, f = 0; f < _.length; f++) h[u] = _[f], u++;
		for (var m = e.length; r < m; r++) {
			for (var b = e[r], f = i, p = b.length; f < p;) {
				var v = Math.floor(f),
					d = Math.ceil(f),
					g = f - v;
				h[u] = b[v] + (b[d] - b[v]) * g, u++, f += c
			}
			i = f - p
		}
		_ = null;
		var S = h.length % o;
		if (0 < S) {
			var M = 2 * (h.length - S);
			_ = new Int16Array(h.buffer.slice(M)), h = new Int16Array(h.buffer.slice(0, M))
		}
		return {
			index: r,
			offset: i,
			frameNext: _,
			sampleRate: a,
			data: h
		}
	};
	var s = 0;

	function t(e) {
		this.id = ++s, A.Traffic && A.Traffic();
		var t = {
			type: "mp3",
			bitRate: 16,
			sampleRate: 16e3,
			onProcess: u
		};
		for (var a in e) t[a] = e[a];
		this.set = t, this._S = 9
	}
	A.Sync = {
			O: 9,
			C: 9
		}, A.prototype = t.prototype = {
			open: function(e, a) {
				var t = this;
				e = e || u, a = a || u;
				var s = function() {
						e(), t._SO = 0
					},
					n = function(e, t) {
						/Permission|Allow/i.test(e) ? a("用户拒绝了录音权限", !0) : !1 === h.isSecureContext ? a("无权录音(需https)") : /Found/i.test(
							e) ? a(t + "，无可用麦克风") : a(t)
					},
					r = A.Sync,
					i = ++r.O,
					_ = r.C;
				t._O = t._O_ = i, t._SO = t._S;
				var o = function() {
					if (_ != r.C || !t._O) {
						var e = "open被取消";
						return i == r.O ? t.close() : e = "open被中断", a(e), !0
					}
				};
				if (A.IsOpen()) s();
				else if (A.Support()) {
					var l = function(e) {
							A.Stream = e, o() || setTimeout(function() {
								o() || (A.IsOpen() ? (function() {
									var e = A.Ctx,
										t = A.Stream,
										a = t._m = e.createMediaStreamSource(t),
										s = t._p = (e.createScriptProcessor || e.createJavaScriptNode).call(e, A.BufferSize, 1, 1);
									a.connect(s), s.connect(e.destination);
									var l = t._call = {};
									s.onaudioprocess = function(e) {
										for (var t in l) {
											for (var a = e.inputBuffer.getChannelData(0), s = a.length, n = new Int16Array(s), r = 0, i = 0; i <
												s; i++) {
												var _ = Math.max(-1, Math.min(1, a[i]));
												_ = _ < 0 ? 32768 * _ : 32767 * _, n[i] = _, r += Math.abs(_)
											}
											for (var o in l) l[o](n, r);
											return
										}
									}
								}(), s()) : a("录音功能无效：无音频流"))
							}, 100)
						},
						f = function(e) {
							var t = e.name || e.message || e.code + ":" + e;
							console.error(e), n(t, "无法录音：" + t)
						},
						c = A.Scope.getUserMedia({
							audio: !0
						}, l, f);
					c && c.then && c.then(l)[e && "catch"](f)
				} else n("", "此浏览器不支持录音")
			},
			close: function(e) {
				e = e || u, this._stop();
				var t = A.Sync;
				if (this._O = 0, this._O_ != t.O) return console.warn("close被忽略"), void e();
				t.C++;
				var a, s = A.Stream;
				if (s) {
					(a = A.Stream)._m && (a._m.disconnect(), a._p.disconnect(), a._p.onaudioprocess = a._p = a._m = null);
					for (var n = s.getTracks && s.getTracks() || s.audioTracks || [], r = 0; r < n.length; r++) {
						var i = n[r];
						i.stop && i.stop()
					}
					s.stop && s.stop()
				}
				A.Stream = 0, e()
			},
			mock: function(e, t) {
				var a = this;
				return a._stop(), a.isMock = 1, a.buffers = [e], a.recSize = e.length, a.srcSampleRate = t, a
			},
			envStart: function(e, t) {
				var a = this,
					s = a.set;
				if (a.isMock = e ? 1 : 0, a.buffers = [], a.recSize = 0, a.envInLast = 0, a.envInFirst = 0, a.envInFix = 0, a.envInFixTs = [],
					s.sampleRate = Math.min(t, s.sampleRate), a.srcSampleRate = t, a.engineCtx = 0, a[s.type + "_start"]) {
					var n = a.engineCtx = a[s.type + "_start"](s);
					n && (n.pcmDatas = [], n.pcmSize = 0)
				}
			},
			envResume: function() {
				this.envInFixTs = []
			},
			envIn: function(e, t) {
				var a = this,
					s = a.set,
					n = a.engineCtx,
					r = e.length;
				a.recSize += r;
				var i = a.buffers;
				i.push(e);
				var _, o = t / r;
				_ = o < 1251 ? Math.round(o / 1250 * 10) : Math.round(Math.min(100, Math.max(0, 100 * (1 + Math.log(o / 1e4) /
					Math.log(10)))));
				var l = a.srcSampleRate,
					f = a.recSize,
					c = Date.now(),
					h = Math.round(r / l * 1e3);
				a.envInLast = c, 1 == a.buffers.length && (a.envInFirst = c - h);
				var u = a.envInFixTs;
				u.splice(0, 0, {
					t: c,
					d: h
				});
				for (var m = c, b = 0, p = 0; p < u.length; p++) {
					var v = u[p];
					if (3e3 < c - v.t) {
						u.length = p;
						break
					}
					m = v.t, b += v.d
				}
				var d = u[1],
					g = c - m;
				if (g / 3 < g - b && (d && 1e3 < g || 6 <= u.length)) {
					var S = c - d.t - h;
					if (h / 5 < S) {
						var M = !s.disableEnvInFix;
						if (console.warn("[" + c + "]" + (M ? "" : "未") + "补偿" + S + "ms"), a.envInFix += S, M) {
							var R = new Int16Array(S * l / 1e3);
							a.recSize += R.length, i.push(R)
						}
					}
				}
				if (n) {
					var w = A.SampleData(i, l, s.sampleRate, n.chunkInfo);
					n.chunkInfo = w, n.pcmSize += w.data.length, f = n.pcmSize, (i = n.pcmDatas).push(w.data), l = w.sampleRate, a[s.type +
						"_encode"](n, w.data)
				}
				var B = Math.round(f / l * 1e3);
				s.onProcess(i, _, B, l)
			},
			start: function() {
				if (A.IsOpen()) {
					console.log("[" + Date.now() + "]Start");
					var e = this,
						t = (e.set, A.Ctx);
					if (e._stop(), e.state = 0, e.envStart(0, t.sampleRate), e._SO && e._SO + 1 != e._S) console.warn("start被中断");
					else {
						e._SO = 0;
						var a = function() {
							e.state = 1, e.resume()
						};
						"suspended" == t.state ? t.resume().then(function() {
							console.log("ctx resume"), a()
						}) : a()
					}
				} else console.error("未open")
			},
			pause: function() {
				this.state && (this.state = 2, delete A.Stream._call[this.id])
			},
			resume: function() {
				var a = this;
				a.state && (a.state = 1, a.envResume(), A.Stream._call[a.id] = function(e, t) {
					1 == a.state && a.envIn(e, t)
				})
			},
			_stop: function(e) {
				var t = this,
					a = t.set;
				t.isMock || t._S++, t.state && (t.pause(), t.state = 0), !e && t[a.type + "_stop"] && (t[a.type + "_stop"](t.engineCtx),
					t.engineCtx = 0)
			},
			stop: function(a, t, e) {
				var s, n = this,
					r = n.set;
				console.log("[" + Date.now() + "]Stop " + (n.envInLast ? n.envInLast - n.envInFirst + "ms 补" + n.envInFix + "ms" :
					"-"));
				var i = function() {
						n._stop(), e && n.close()
					},
					_ = function(e) {
						t && t(e), i()
					},
					o = function(e, t) {
						console.log("[" + Date.now() + "]结束 编码" + (Date.now() - s) + "ms 音频" + t + "ms/" + e.size + "b"), e.size < Math.max(
							100, t / 2) ? _("生成的" + r.type + "无效") : (a && a(e, t), i())
					};
				if (!n.isMock) {
					if (!n.state) return void _("未开始录音");
					n._stop(!0)
				}
				var l = n.recSize;
				if (l)
					if (n.buffers[0])
						if (n[r.type]) {
							var f = n.engineCtx;
							if (n[r.type + "_complete"] && f) {
								f.pcmDatas;
								var c = Math.round(f.pcmSize / r.sampleRate * 1e3);
								return s = Date.now(), void n[r.type + "_complete"](f, function(e) {
									o(e, c)
								}, _)
							}
							s = Date.now();
							var h = A.SampleData(n.buffers, n.srcSampleRate, r.sampleRate);
							r.sampleRate = h.sampleRate;
							var u = h.data;
							c = Math.round(u.length / r.sampleRate * 1e3), console.log("采样" + l + "->" + u.length + " 花:" + (Date.now() - s) +
								"ms"), setTimeout(function() {
								s = Date.now(), n[r.type](u, function(e) {
									o(e, c)
								}, function(e) {
									_(e)
								})
							})
						} else _("未加载" + r.type + "编码器");
				else _("音频被释放");
				else _("未采集到录音")
			}
		}, h.Recorder && h.Recorder.Destroy(), (h.Recorder = A).LM = "2019-11-7 21:47:48", A.TrafficImgUrl =
		"//ia.51.la/go1?id=20469973&pvFlag=1", A.Traffic = function() {
			var e = A.TrafficImgUrl;
			if (e) {
				var t = A.Traffic,
					a = location.href.replace(/#.*/, "");
				if (!t[a]) {
					t[a] = 1;
					var s = new Image;
					s.src = e, console.log("Traffic Analysis Image: Recorder.TrafficImgUrl=" + e)
				}
			}
		}
}(window), "function" == typeof define && define.amd && define(function() {
		return Recorder
	}), "object" == typeof module && module.exports && (module.exports = Recorder),
	function() {
		"use strict";
		var i;
		Recorder.prototype.enc_mp3 = {
			stable: !0,
			testmsg: "采样率范围48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000"
		}, Recorder.prototype.mp3 = function(a, s, e) {
			var n = this.set,
				r = a.length,
				t = this.mp3_start(n);
			if (t) return this.mp3_encode(t, a), void this.mp3_complete(t, s, e, 1);
			var i = new Recorder.lamejs.Mp3Encoder(1, n.sampleRate, n.bitRate),
				_ = [],
				o = 0,
				l = 0,
				f = function() {
					if (o < r) {
						0 < (e = i.encodeBuffer(a.subarray(o, o + 57600))).length && (l += e.buffer.byteLength, _.push(e.buffer)), o +=
							57600, setTimeout(f)
					} else {
						var e;
						0 < (e = i.flush()).length && (l += e.buffer.byteLength, _.push(e.buffer));
						var t = c.fn(_, l, r, n.sampleRate);
						h(t, n), s(new Blob(_, {
							type: "audio/mp3"
						}))
					}
				};
			f()
		}, Recorder.BindDestroy("mp3Worker", function() {
			console.log("mp3Worker Destroy"), i && i.terminate(), i = null
		});
		var _ = {
			id: 0
		};
		Recorder.prototype.mp3_start = function(e) {
			var t = i;
			try {
				if (!t) {
					var a = ");wk_lame();var wk_ctxs={};self.onmessage=" + function(e) {
						var t = e.data,
							a = wk_ctxs[t.id];
						if ("init" == t.action) wk_ctxs[t.id] = {
							sampleRate: t.sampleRate,
							bitRate: t.bitRate,
							mp3Size: 0,
							pcmSize: 0,
							encArr: [],
							encObj: new wk_lame.Mp3Encoder(1, t.sampleRate, t.bitRate)
						};
						else if (!a) return;
						switch (t.action) {
							case "stop":
								a.encObj = null, delete wk_ctxs[t.id];
								break;
							case "encode":
								a.pcmSize += t.pcm.length, 0 < (s = a.encObj.encodeBuffer(t.pcm)).length && (a.mp3Size += s.buffer.byteLength,
									a.encArr.push(s.buffer));
								break;
							case "complete":
								var s;
								0 < (s = a.encObj.flush()).length && (a.mp3Size += s.buffer.byteLength, a.encArr.push(s.buffer));
								var n = wk_mp3TrimFix.fn(a.encArr, a.mp3Size, a.pcmSize, a.sampleRate);
								self.postMessage({
									action: t.action,
									id: t.id,
									blob: new Blob(a.encArr, {
										type: "audio/mp3"
									}),
									meta: n
								})
						}
					};
					a += ";var wk_mp3TrimFix={rm:" + c.rm + ",fn:" + c.fn + "}";
					var s = Recorder.lamejs.toString(),
						n = (window.URL || webkitURL).createObjectURL(new Blob(["var wk_lame=(", s, a], {
							type: "text/javascript"
						}));
					t = new Worker(n), (window.URL || webkitURL).revokeObjectURL(n), t.onmessage = function(e) {
						var t = _[e.data.id];
						t && (t.call && t.call(e.data), t.call = null)
					}
				}
				var r = {
					worker: t,
					set: e
				};
				return r.id = ++_.id, _[r.id] = r, t.postMessage({
					action: "init",
					id: r.id,
					sampleRate: e.sampleRate,
					bitRate: e.bitRate,
					x: new Int16Array(5)
				}), i = t, r
			} catch (e) {
				return t && t.terminate(), console.error(e), null
			}
		}, Recorder.prototype.mp3_stop = function(e) {
			if (e && e.worker) {
				e.worker.postMessage({
					action: "stop",
					id: e.id
				}), e.worker = null, delete _[e.id];
				var t = -1;
				for (var a in _) t++;
				t && console.warn("mp3 worker剩" + t + "个在串行等待")
			}
		}, Recorder.prototype.mp3_encode = function(e, t) {
			e && e.worker && e.worker.postMessage({
				action: "encode",
				id: e.id,
				pcm: t
			})
		}, Recorder.prototype.mp3_complete = function(t, a, e, s) {
			var n = this;
			t && t.worker ? (t.call = function(e) {
				h(e.meta, t.set), a(e.blob), s && n.mp3_stop(t)
			}, t.worker.postMessage({
				action: "complete",
				id: t.id
			})) : e("mp3编码器未打开")
		}, Recorder.mp3ReadMeta = function(e, t) {
			var a = new Uint8Array(e[0] || []);
			if (a.length < 4) return null;
			var s = function(e, t) {
					return ("0000000" + ((t || a)[e] || 0).toString(2)).substr(-8)
				},
				n = s(0) + s(1),
				r = s(2) + s(3);
			if (!/^1{11}/.test(n)) return null;
			var i = {
					"00": 2.5,
					10: 2,
					11: 1
				} [n.substr(11, 2)],
				_ = {
					"01": 3
				} [n.substr(13, 2)],
				o = {
					1: [44100, 48e3, 32e3],
					2: [22050, 24e3, 16e3],
					2.5: [11025, 12e3, 8e3]
				} [i];
			o && (o = o[parseInt(r.substr(4, 2), 2)]);
			var l = [
				[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
				[0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
			][1 == i ? 1 : 0][parseInt(r.substr(0, 4), 2)];
			if (!(i && _ && l && o)) return null;
			for (var f = Math.round(8 * t / l), c = 1 == _ ? 384 : 2 == _ ? 1152 : 1 == i ? 1152 : 576, h = c / o * 1e3, u =
					Math.floor(c * l / 8 / o * 1e3), m = 0, b = 0, p = 0; p < e.length; p++) {
				var v = e[p];
				if (u + 3 <= (b += v.byteLength)) {
					var d = new Uint8Array(v);
					m = "1" == s(v.byteLength - (b - (u + 3) + 1), d).charAt(6);
					break
				}
			}
			return m && u++, {
				version: i,
				layer: _,
				sampleRate: o,
				bitRate: l,
				duration: f,
				size: t,
				hasPadding: m,
				frameSize: u,
				frameDurationFloat: h
			}
		};
		var c = {
				rm: Recorder.mp3ReadMeta,
				fn: function(e, t, a, s) {
					var n = this.rm(e, t);
					if (!n) return {
						err: "mp3非预定格式"
					};
					var r = Math.round(a / s * 1e3),
						i = Math.floor((n.duration - r) / n.frameDurationFloat);
					if (0 < i) {
						var _ = i * n.frameSize - (n.hasPadding ? 1 : 0);
						t -= _;
						for (var o = 0, l = [], f = 0; f < e.length; f++) {
							var c = e[f];
							if (_ <= 0) break;
							_ >= c.byteLength ? (_ -= c.byteLength, l.push(c), e.splice(f, 1), f--) : (e[f] = c.slice(_), o = c, _ = 0)
						}
						if (!this.rm(e, t)) {
							o && (e[0] = o);
							for (f = 0; f < l.length; f++) e.splice(f, 0, l[f]);
							n.err = "fix后数据错误，已还原，错误原因不明"
						}
						var h = n.trimFix = {};
						h.remove = i, h.removeDuration = Math.round(i * n.frameDurationFloat), h.duration = Math.round(8 * t / n.bitRate)
					}
					return n
				}
			},
			h = function(e, t) {
				var a = "MP3信息 ";
				(e.sampleRate && e.sampleRate != t.sampleRate || e.bitRate && e.bitRate != t.bitRate) && (console.warn(a +
						"和设置的不匹配set:" + t.bitRate + "kbps " + t.sampleRate + "hz，已更新set:" + e.bitRate + "kbps " + e.sampleRate + "hz", t),
					t.sampleRate = e.sampleRate, t.bitRate = e.bitRate);
				var s = e.trimFix;
				s ? (a += "Fix移除" + s.remove + "帧" + s.removeDuration + "ms -> " + s.duration + "ms", 2 < s.remove && (e.err = (e.err ?
					e.err + ", " : "") + "移除帧数过多")) : a += (e.duration || "-") + "ms", e.err ? console.error(a, e.err, e) : console.log(
					a, e)
			}
	}(),
	function() {
		"use strict";

		function t() {
			var A = function(e) {
				return Math.log(e) / Math.log(10)
			};

			function B(e) {
				return new Int8Array(e)
			}

			function n(e) {
				return new Int16Array(e)
			}

			function Be(e) {
				return new Int32Array(e)
			}

			function Ae(e) {
				return new Float32Array(e)
			}

			function s(e) {
				return new Float64Array(e)
			}

			function Te(e) {
				if (1 == e.length) return Ae(e[0]);
				var t = e[0];
				e = e.slice(1);
				for (var a = [], s = 0; s < t; s++) a.push(Te(e));
				return a
			}

			function C(e) {
				if (1 == e.length) return Be(e[0]);
				var t = e[0];
				e = e.slice(1);
				for (var a = [], s = 0; s < t; s++) a.push(C(e));
				return a
			}

			function b(e) {
				if (1 == e.length) return n(e[0]);
				var t = e[0];
				e = e.slice(1);
				for (var a = [], s = 0; s < t; s++) a.push(b(e));
				return a
			}

			function N(e) {
				if (1 == e.length) return new Array(e[0]);
				var t = e[0];
				e = e.slice(1);
				for (var a = [], s = 0; s < t; s++) a.push(N(e));
				return a
			}
			var xe = {
					fill: function(e, t, a, s) {
						if (2 == arguments.length)
							for (var n = 0; n < e.length; n++) e[n] = t;
						else
							for (n = t; n < a; n++) e[n] = s
					}
				},
				$ = {
					arraycopy: function(e, t, a, s, n) {
						for (var r = t + n; t < r;) a[s++] = e[t++]
					}
				},
				ee = {};

			function ke(e) {
				this.ordinal = e
			}
			ee.SQRT2 = 1.4142135623730951, ee.FAST_LOG10 = function(e) {
					return A(e)
				}, ee.FAST_LOG10_X = function(e, t) {
					return A(e) * t
				}, ke.short_block_allowed = new ke(0), ke.short_block_coupled = new ke(1), ke.short_block_dispensed = new ke(2), ke
				.short_block_forced = new ke(3);
			var K = {};

			function ye(e) {
				this.ordinal = e
			}
			K.MAX_VALUE = 3.4028235e38, ye.vbr_off = new ye(0), ye.vbr_mt = new ye(1), ye.vbr_rh = new ye(2), ye.vbr_abr = new ye(
				3), ye.vbr_mtrh = new ye(4), ye.vbr_default = ye.vbr_mtrh;

			function Ee(e) {
				var t = e;
				this.ordinal = function() {
					return t
				}
			}

			function T() {
				var M = null;

				function v(e) {
					this.bits = 0 | e
				}
				this.qupvt = null, this.setModules = function(e) {
					this.qupvt = e, M = e
				};
				var n = [
					[0, 0],
					[0, 0],
					[0, 0],
					[0, 0],
					[0, 0],
					[0, 1],
					[1, 1],
					[1, 1],
					[1, 2],
					[2, 2],
					[2, 3],
					[2, 3],
					[3, 4],
					[3, 4],
					[3, 4],
					[4, 5],
					[4, 5],
					[4, 6],
					[5, 6],
					[5, 6],
					[5, 7],
					[6, 7],
					[6, 7]
				];

				function R(e, t, a, s, n, r) {
					var i = .5946 / t;
					for (e >>= 1; 0 != e--;) n[r++] = i > a[s++] ? 0 : 1, n[r++] = i > a[s++] ? 0 : 1
				}

				function w(e, t, a, s, n, r) {
					var i = (e >>= 1) % 2;
					for (e >>= 1; 0 != e--;) {
						var _, o, l, f, c, h, u, m;
						_ = a[s++] * t, o = a[s++] * t, c = 0 | _, l = a[s++] * t, h = 0 | o, f = a[s++] * t, u = 0 | l, _ += M.adj43[c],
							m = 0 | f, o += M.adj43[h], n[r++] = 0 | _, l += M.adj43[u], n[r++] = 0 | o, f += M.adj43[m], n[r++] = 0 | l, n[
								r++] = 0 | f
					}
					0 != i && (c = 0 | (_ = a[s++] * t), h = 0 | (o = a[s++] * t), _ += M.adj43[c], o += M.adj43[h], n[r++] = 0 | _, n[
						r++] = 0 | o)
				}
				var _ = [1, 2, 5, 7, 7, 10, 10, 13, 13, 13, 13, 13, 13, 13, 13];

				function d(e, t, a, s) {
					var n = function(e, t, a) {
						var s = 0,
							n = 0;
						do {
							var r = e[t++],
								i = e[t++];
							s < r && (s = r), n < i && (n = i)
						} while (t < a);
						return s < n && (s = n), s
					}(e, t, a);
					switch (n) {
						case 0:
							return n;
						case 1:
							return function(e, t, a, s) {
								var n = 0,
									r = j.ht[1].hlen;
								do {
									var i = 2 * e[t + 0] + e[t + 1];
									t += 2, n += r[i]
								} while (t < a);
								return s.bits += n, 1
							}(e, t, a, s);
						case 2:
						case 3:
							return function(e, t, a, s, n) {
								var r, i, _ = 0,
									o = j.ht[s].xlen;
								i = 2 == s ? j.table23 : j.table56;
								do {
									var l = e[t + 0] * o + e[t + 1];
									t += 2, _ += i[l]
								} while (t < a);
								return (r = 65535 & _) < (_ >>= 16) && (_ = r, s++), n.bits += _, s
							}(e, t, a, _[n - 1], s);
						case 4:
						case 5:
						case 6:
						case 7:
						case 8:
						case 9:
						case 10:
						case 11:
						case 12:
						case 13:
						case 14:
						case 15:
							return function(e, t, a, s, n) {
								var r = 0,
									i = 0,
									_ = 0,
									o = j.ht[s].xlen,
									l = j.ht[s].hlen,
									f = j.ht[s + 1].hlen,
									c = j.ht[s + 2].hlen;
								do {
									var h = e[t + 0] * o + e[t + 1];
									t += 2, r += l[h], i += f[h], _ += c[h]
								} while (t < a);
								var u = s;
								return i < r && (r = i, u++), _ < r && (r = _, u = s + 2), n.bits += r, u
							}(e, t, a, _[n - 1], s);
						default:
							if (y.IXMAX_VAL < n) return s.bits = y.LARGE_BITS, -1;
							var r, i;
							for (n -= 15, r = 24; r < 32 && !(j.ht[r].linmax >= n); r++);
							for (i = r - 8; i < 24 && !(j.ht[i].linmax >= n); i++);
							return function(e, t, a, s, n, r) {
								var i, _ = 65536 * j.ht[s].xlen + j.ht[n].xlen,
									o = 0;
								do {
									var l = e[t++],
										f = e[t++];
									0 != l && (14 < l && (l = 15, o += _), l *= 16), 0 != f && (14 < f && (f = 15, o += _), l += f), o += j.largetbl[
										l]
								} while (t < a);
								return (i = 65535 & o) < (o >>= 16) && (o = i, s = n), r.bits += o, s
							}(e, t, a, i, r, s)
					}
				}

				function u(e, t, a, s, n, r, i, _) {
					for (var o = t.big_values, l = 2; l < Pe.SBMAX_l + 1; l++) {
						var f = e.scalefac_band.l[l];
						if (o <= f) break;
						var c = n[l - 2] + t.count1bits;
						if (a.part2_3_length <= c) break;
						var h = new v(c),
							u = d(s, f, o, h);
						c = h.bits, a.part2_3_length <= c || (a.assign(t), a.part2_3_length = c, a.region0_count = r[l - 2], a.region1_count =
							l - 2 - r[l - 2], a.table_select[0] = i[l - 2], a.table_select[1] = _[l - 2], a.table_select[2] = u)
					}
				}
				this.noquant_count_bits = function(e, t, a) {
					var s = t.l3_enc,
						n = Math.min(576, t.max_nonzero_coeff + 2 >> 1 << 1);
					for (null != a && (a.sfb_count1 = 0); 1 < n && 0 == (s[n - 1] | s[n - 2]); n -= 2);
					t.count1 = n;
					for (var r = 0, i = 0; 3 < n; n -= 4) {
						var _;
						if (1 < (2147483647 & (s[n - 1] | s[n - 2] | s[n - 3] | s[n - 4]))) break;
						_ = 2 * (2 * (2 * s[n - 4] + s[n - 3]) + s[n - 2]) + s[n - 1], r += j.t32l[_], i += j.t33l[_]
					}
					var o = r;
					if (t.count1table_select = 0, i < r && (o = i, t.count1table_select = 1), t.count1bits = o, 0 == (t.big_values =
							n)) return o;
					if (t.block_type == Pe.SHORT_TYPE)(r = 3 * e.scalefac_band.s[3]) > t.big_values && (r = t.big_values), i = t.big_values;
					else if (t.block_type == Pe.NORM_TYPE) {
						if (r = t.region0_count = e.bv_scf[n - 2], i = t.region1_count = e.bv_scf[n - 1], i = e.scalefac_band.l[r + i +
								2], r = e.scalefac_band.l[r + 1], i < n) {
							var l = new v(o);
							t.table_select[2] = d(s, i, n, l), o = l.bits
						}
					} else t.region0_count = 7, t.region1_count = Pe.SBMAX_l - 1 - 7 - 1, (i = n) < (r = e.scalefac_band.l[8]) && (r =
						i);
					if (r = Math.min(r, n), i = Math.min(i, n), 0 < r) {
						l = new v(o);
						t.table_select[0] = d(s, 0, r, l), o = l.bits
					}
					if (r < i) {
						l = new v(o);
						t.table_select[1] = d(s, r, i, l), o = l.bits
					}
					if (2 == e.use_best_huffman && (t.part2_3_length = o, best_huffman_divide(e, t), o = t.part2_3_length), null != a &&
						t.block_type == Pe.NORM_TYPE) {
						for (var f = 0; e.scalefac_band.l[f] < t.big_values;) f++;
						a.sfb_count1 = f
					}
					return o
				}, this.count_bits = function(e, t, a, s) {
					var n = a.l3_enc,
						r = y.IXMAX_VAL / M.IPOW20(a.global_gain);
					if (a.xrpow_max > r) return y.LARGE_BITS;
					if (function(e, t, a, s, n) {
							var r, i, _, o = 0,
								l = 0,
								f = 0,
								c = 0,
								h = t,
								u = 0,
								m = h,
								b = 0,
								p = e,
								v = 0;
							for (_ = null != n && s.global_gain == n.global_gain, i = s.block_type == Pe.SHORT_TYPE ? 38 : 21, r = 0; r <=
								i; r++) {
								var d = -1;
								if ((_ || s.block_type == Pe.NORM_TYPE) && (d = s.global_gain - (s.scalefac[r] + (0 != s.preflag ? M.pretab[r] :
										0) << s.scalefac_scale + 1) - 8 * s.subblock_gain[s.window[r]]), _ && n.step[r] == d) 0 != l && (w(l, a, p,
									v, m, b), l = 0), 0 != f && (R(f, a, p, v, m, b), f = 0);
								else {
									var g, S = s.width[r];
									if (o + s.width[r] > s.max_nonzero_coeff && (g = s.max_nonzero_coeff - o + 1, xe.fill(t, s.max_nonzero_coeff,
											576, 0), (S = g) < 0 && (S = 0), r = i + 1), 0 == l && 0 == f && (m = h, b = u, p = e, v = c), null != n &&
										0 < n.sfb_count1 && r >= n.sfb_count1 && 0 < n.step[r] && d >= n.step[r] ? (0 != l && (w(l, a, p, v, m, b),
											l = 0, m = h, b = u, p = e, v = c), f += S) : (0 != f && (R(f, a, p, v, m, b), f = 0, m = h, b = u, p = e,
											v = c), l += S), S <= 0) {
										0 != f && (R(f, a, p, v, m, b), f = 0), 0 != l && (w(l, a, p, v, m, b), l = 0);
										break
									}
								}
								r <= i && (u += s.width[r], c += s.width[r], o += s.width[r])
							}
							0 != l && (w(l, a, p, v, m, b), l = 0), 0 != f && (R(f, a, p, v, m, b), f = 0)
						}(t, n, M.IPOW20(a.global_gain), a, s), 0 != (2 & e.substep_shaping))
						for (var i = 0, _ = a.global_gain + a.scalefac_scale, o = .634521682242439 / M.IPOW20(_), l = 0; l < a.sfbmax; l++) {
							var f, c = a.width[l];
							if (0 == e.pseudohalf[l]) i += c;
							else
								for (f = i, i += c; f < i; ++f) n[f] = t[f] >= o ? n[f] : 0
						}
					return this.noquant_count_bits(e, a, s)
				}, this.best_huffman_divide = function(e, t) {
					var a = new k,
						s = t.l3_enc,
						n = Be(23),
						r = Be(23),
						i = Be(23),
						_ = Be(23);
					if (t.block_type != Pe.SHORT_TYPE || 1 != e.mode_gr) {
						a.assign(t), t.block_type == Pe.NORM_TYPE && (! function(e, t, a, s, n, r, i) {
							for (var _ = t.big_values, o = 0; o <= 22; o++) s[o] = y.LARGE_BITS;
							for (o = 0; o < 16; o++) {
								var l = e.scalefac_band.l[o + 1];
								if (_ <= l) break;
								var f = 0,
									c = new v(f),
									h = d(a, 0, l, c);
								f = c.bits;
								for (var u = 0; u < 8; u++) {
									var m = e.scalefac_band.l[o + u + 2];
									if (_ <= m) break;
									var b = f,
										p = d(a, l, m, c = new v(b));
									b = c.bits, s[o + u] > b && (s[o + u] = b, r[(n[o + u] = o) + u] = h, i[o + u] = p)
								}
							}
						}(e, t, s, n, r, i, _), u(e, a, t, s, n, r, i, _));
						var o = a.big_values;
						if (!(0 == o || 1 < (s[o - 2] | s[o - 1]) || 576 < (o = t.count1 + 2))) {
							a.assign(t), a.count1 = o;
							for (var l = 0, f = 0; o > a.big_values; o -= 4) {
								var c = 2 * (2 * (2 * s[o - 4] + s[o - 3]) + s[o - 2]) + s[o - 1];
								l += j.t32l[c], f += j.t33l[c]
							}
							if (a.big_values = o, a.count1table_select = 0, f < l && (l = f, a.count1table_select = 1), a.count1bits = l, a
								.block_type == Pe.NORM_TYPE) u(e, a, t, s, n, r, i, _);
							else {
								if (a.part2_3_length = l, o < (l = e.scalefac_band.l[8]) && (l = o), 0 < l) {
									var h = new v(a.part2_3_length);
									a.table_select[0] = d(s, 0, l, h), a.part2_3_length = h.bits
								}
								if (l < o) {
									h = new v(a.part2_3_length);
									a.table_select[1] = d(s, l, o, h), a.part2_3_length = h.bits
								}
								t.part2_3_length > a.part2_3_length && t.assign(a)
							}
						}
					}
				};
				var h = [1, 1, 1, 1, 8, 2, 2, 2, 4, 4, 4, 8, 8, 8, 16, 16],
					m = [1, 2, 4, 8, 1, 2, 4, 8, 2, 4, 8, 2, 4, 8, 4, 8],
					b = [0, 0, 0, 0, 3, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4],
					p = [0, 1, 2, 3, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 2, 3];
				T.slen1_tab = b, T.slen2_tab = p, this.best_scalefac_store = function(e, t, a, s) {
					var n, r, i, _, o = s.tt[t][a],
						l = 0;
					for (n = i = 0; n < o.sfbmax; n++) {
						var f = o.width[n];
						for (i += f, _ = -f; _ < 0 && 0 == o.l3_enc[_ + i]; _++);
						0 == _ && (o.scalefac[n] = l = -2)
					}
					if (0 == o.scalefac_scale && 0 == o.preflag) {
						var c = 0;
						for (n = 0; n < o.sfbmax; n++) 0 < o.scalefac[n] && (c |= o.scalefac[n]);
						if (0 == (1 & c) && 0 != c) {
							for (n = 0; n < o.sfbmax; n++) 0 < o.scalefac[n] && (o.scalefac[n] >>= 1);
							o.scalefac_scale = l = 1
						}
					}
					if (0 == o.preflag && o.block_type != Pe.SHORT_TYPE && 2 == e.mode_gr) {
						for (n = 11; n < Pe.SBPSY_l && !(o.scalefac[n] < M.pretab[n] && -2 != o.scalefac[n]); n++);
						if (n == Pe.SBPSY_l) {
							for (n = 11; n < Pe.SBPSY_l; n++) 0 < o.scalefac[n] && (o.scalefac[n] -= M.pretab[n]);
							o.preflag = l = 1
						}
					}
					for (r = 0; r < 4; r++) s.scfsi[a][r] = 0;
					for (2 == e.mode_gr && 1 == t && s.tt[0][a].block_type != Pe.SHORT_TYPE && s.tt[1][a].block_type != Pe.SHORT_TYPE &&
						(! function(e, t) {
							for (var a, s = t.tt[1][e], n = t.tt[0][e], r = 0; r < j.scfsi_band.length - 1; r++) {
								for (a = j.scfsi_band[r]; a < j.scfsi_band[r + 1] && !(n.scalefac[a] != s.scalefac[a] && 0 <= s.scalefac[a]); a++)
								;
								if (a == j.scfsi_band[r + 1]) {
									for (a = j.scfsi_band[r]; a < j.scfsi_band[r + 1]; a++) s.scalefac[a] = -1;
									t.scfsi[e][r] = 1
								}
							}
							var i = 0,
								_ = 0;
							for (a = 0; a < 11; a++) - 1 != s.scalefac[a] && (_++, i < s.scalefac[a] && (i = s.scalefac[a]));
							for (var o = 0, l = 0; a < Pe.SBPSY_l; a++) - 1 != s.scalefac[a] && (l++, o < s.scalefac[a] && (o = s.scalefac[
								a]));
							for (r = 0; r < 16; r++)
								if (i < h[r] && o < m[r]) {
									var f = b[r] * _ + p[r] * l;
									s.part2_length > f && (s.part2_length = f, s.scalefac_compress = r)
								}
						}(a, s), l = 0), n = 0; n < o.sfbmax; n++) - 2 == o.scalefac[n] && (o.scalefac[n] = 0);
					0 != l && (2 == e.mode_gr ? this.scale_bitcount(o) : this.scale_bitcount_lsf(e, o))
				};
				var o = [0, 18, 36, 54, 54, 36, 54, 72, 54, 72, 90, 72, 90, 108, 108, 126],
					l = [0, 18, 36, 54, 51, 35, 53, 71, 52, 70, 88, 69, 87, 105, 104, 122],
					f = [0, 10, 20, 30, 33, 21, 31, 41, 32, 42, 52, 43, 53, 63, 64, 74];
				this.scale_bitcount = function(e) {
					var t, a, s, n = 0,
						r = 0,
						i = e.scalefac;
					if (e.block_type == Pe.SHORT_TYPE) s = o, 0 != e.mixed_block_flag && (s = l);
					else if (s = f, 0 == e.preflag) {
						for (a = 11; a < Pe.SBPSY_l && !(i[a] < M.pretab[a]); a++);
						if (a == Pe.SBPSY_l)
							for (e.preflag = 1, a = 11; a < Pe.SBPSY_l; a++) i[a] -= M.pretab[a]
					}
					for (a = 0; a < e.sfbdivide; a++) n < i[a] && (n = i[a]);
					for (; a < e.sfbmax; a++) r < i[a] && (r = i[a]);
					for (e.part2_length = y.LARGE_BITS, t = 0; t < 16; t++) n < h[t] && r < m[t] && e.part2_length > s[t] && (e.part2_length =
						s[t], e.scalefac_compress = t);
					return e.part2_length == y.LARGE_BITS
				};
				var g = [
					[15, 15, 7, 7],
					[15, 15, 7, 0],
					[7, 3, 0, 0],
					[15, 31, 31, 0],
					[7, 7, 7, 0],
					[3, 3, 0, 0]
				];
				this.scale_bitcount_lsf = function(e, t) {
					var a, s, n, r, i, _, o, l, f = Be(4),
						c = t.scalefac;
					for (a = 0 != t.preflag ? 2 : 0, o = 0; o < 4; o++) f[o] = 0;
					if (t.block_type == Pe.SHORT_TYPE) {
						s = 1;
						var h = M.nr_of_sfb_block[a][s];
						for (n = l = 0; n < 4; n++)
							for (r = h[n] / 3, o = 0; o < r; o++, l++)
								for (i = 0; i < 3; i++) c[3 * l + i] > f[n] && (f[n] = c[3 * l + i])
					} else {
						s = 0;
						h = M.nr_of_sfb_block[a][s];
						for (n = l = 0; n < 4; n++)
							for (r = h[n], o = 0; o < r; o++, l++) c[l] > f[n] && (f[n] = c[l])
					}
					for (_ = !1, n = 0; n < 4; n++) f[n] > g[a][n] && (_ = !0);
					if (!_) {
						var u, m, b, p;
						for (t.sfb_partition_table = M.nr_of_sfb_block[a][s], n = 0; n < 4; n++) t.slen[n] = S[f[n]];
						switch (u = t.slen[0], m = t.slen[1], b = t.slen[2], p = t.slen[3], a) {
							case 0:
								t.scalefac_compress = (5 * u + m << 4) + (b << 2) + p;
								break;
							case 1:
								t.scalefac_compress = 400 + (5 * u + m << 2) + b;
								break;
							case 2:
								t.scalefac_compress = 500 + 3 * u + m;
								break;
							default:
								$.err.printf("intensity stereo not implemented yet\n")
						}
					}
					if (!_)
						for (n = t.part2_length = 0; n < 4; n++) t.part2_length += t.slen[n] * t.sfb_partition_table[n];
					return _
				};
				var S = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4];
				this.huffman_init = function(e) {
					for (var t = 2; t <= 576; t += 2) {
						for (var a, s = 0; e.scalefac_band.l[++s] < t;);
						for (a = n[s][0]; e.scalefac_band.l[a + 1] > t;) a--;
						for (a < 0 && (a = n[s][0]), e.bv_scf[t - 2] = a, a = n[s][1]; e.scalefac_band.l[a + e.bv_scf[t - 2] + 2] > t;) a--;
						a < 0 && (a = n[s][1]), e.bv_scf[t - 1] = a
					}
				}
			}

			function X() {}

			function M() {
				this.setModules = function(e, t, a) {
					e,
					t,
					a
				};
				var _ = [0, 49345, 49537, 320, 49921, 960, 640, 49729, 50689, 1728, 1920, 51009, 1280, 50625, 50305, 1088, 52225,
					3264, 3456, 52545, 3840, 53185, 52865, 3648, 2560, 51905, 52097, 2880, 51457, 2496, 2176, 51265, 55297, 6336,
					6528, 55617, 6912, 56257, 55937, 6720, 7680, 57025, 57217, 8e3, 56577, 7616, 7296, 56385, 5120, 54465, 54657,
					5440, 55041, 6080, 5760, 54849, 53761, 4800, 4992, 54081, 4352, 53697, 53377, 4160, 61441, 12480, 12672, 61761,
					13056, 62401, 62081, 12864, 13824, 63169, 63361, 14144, 62721, 13760, 13440, 62529, 15360, 64705, 64897, 15680,
					65281, 16320, 16e3, 65089, 64001, 15040, 15232, 64321, 14592, 63937, 63617, 14400, 10240, 59585, 59777, 10560,
					60161, 11200, 10880, 59969, 60929, 11968, 12160, 61249, 11520, 60865, 60545, 11328, 58369, 9408, 9600, 58689,
					9984, 59329, 59009, 9792, 8704, 58049, 58241, 9024, 57601, 8640, 8320, 57409, 40961, 24768, 24960, 41281, 25344,
					41921, 41601, 25152, 26112, 42689, 42881, 26432, 42241, 26048, 25728, 42049, 27648, 44225, 44417, 27968, 44801,
					28608, 28288, 44609, 43521, 27328, 27520, 43841, 26880, 43457, 43137, 26688, 30720, 47297, 47489, 31040, 47873,
					31680, 31360, 47681, 48641, 32448, 32640, 48961, 32e3, 48577, 48257, 31808, 46081, 29888, 30080, 46401, 30464,
					47041, 46721, 30272, 29184, 45761, 45953, 29504, 45313, 29120, 28800, 45121, 20480, 37057, 37249, 20800, 37633,
					21440, 21120, 37441, 38401, 22208, 22400, 38721, 21760, 38337, 38017, 21568, 39937, 23744, 23936, 40257, 24320,
					40897, 40577, 24128, 23040, 39617, 39809, 23360, 39169, 22976, 22656, 38977, 34817, 18624, 18816, 35137, 19200,
					35777, 35457, 19008, 19968, 36545, 36737, 20288, 36097, 19904, 19584, 35905, 17408, 33985, 34177, 17728, 34561,
					18368, 18048, 34369, 33281, 17088, 17280, 33601, 16640, 33217, 32897, 16448
				];
				this.updateMusicCRC = function(e, t, a, s) {
					for (var n = 0; n < s; ++n) e[0] = (r = t[a + n], i = (i = e[0]) >> 8 ^ _[255 & (i ^ r)]);
					var r, i
				}
			}

			function q() {
				var o = this,
					s = 32773,
					c = null,
					h = null,
					r = null,
					u = null;
				this.setModules = function(e, t, a, s) {
					c = e, h = t, r = a, u = s
				};
				var m = null,
					l = 0,
					b = 0,
					p = 0;

				function v(e, t, a) {
					for (; 0 < a;) {
						var s;
						0 == p && (p = 8, b++, e.header[e.w_ptr].write_timing == l && (n = e, $.arraycopy(n.header[n.w_ptr].buf, 0, m, b,
								n.sideinfo_len), b += n.sideinfo_len, l += 8 * n.sideinfo_len, n.w_ptr = n.w_ptr + 1 & Z.MAX_HEADER_BUF - 1),
							m[b] = 0), a -= s = Math.min(a, p), p -= s, m[b] |= t >> a << p, l += s
					}
					var n
				}

				function i(e, t, a) {
					for (; 0 < a;) {
						var s;
						0 == p && (p = 8, m[++b] = 0), a -= s = Math.min(a, p), p -= s, m[b] |= t >> a << p, l += s
					}
				}

				function _(e, t) {
					var a, s = e.internal_flags;
					if (8 <= t && (v(s, 76, 8), t -= 8), 8 <= t && (v(s, 65, 8), t -= 8), 8 <= t && (v(s, 77, 8), t -= 8), 8 <= t && (
							v(s, 69, 8), t -= 8), 32 <= t) {
						var n = r.getLameShortVersion();
						if (32 <= t)
							for (a = 0; a < n.length && 8 <= t; ++a) t -= 8, v(s, n.charCodeAt(a), 8)
					}
					for (; 1 <= t; t -= 1) v(s, s.ancillary_flag, 1), s.ancillary_flag ^= e.disable_reservoir ? 0 : 1
				}

				function f(e, t, a) {
					for (var s = e.header[e.h_ptr].ptr; 0 < a;) {
						var n = Math.min(a, 8 - (7 & s));
						a -= n, e.header[e.h_ptr].buf[s >> 3] |= t >> a << 8 - (7 & s) - n, s += n
					}
					e.header[e.h_ptr].ptr = s
				}

				function n(e, t) {
					e <<= 8;
					for (var a = 0; a < 8; a++) 0 != (65536 & ((t <<= 1) ^ (e <<= 1))) && (t ^= s);
					return t
				}

				function d(e, t) {
					var a, s = j.ht[t.count1table_select + 32],
						n = 0,
						r = t.big_values,
						i = t.big_values;
					for (a = (t.count1 - t.big_values) / 4; 0 < a; --a) {
						var _ = 0,
							o = 0;
						0 != t.l3_enc[r + 0] && (o += 8, t.xr[i + 0] < 0 && _++), 0 != t.l3_enc[r + 1] && (o += 4, _ *= 2, t.xr[i + 1] <
							0 && _++), 0 != t.l3_enc[r + 2] && (o += 2, _ *= 2, t.xr[i + 2] < 0 && _++), 0 != t.l3_enc[r + 3] && (o++, _ *=
							2, t.xr[i + 3] < 0 && _++), r += 4, i += 4, v(e, _ + s.table[o], s.hlen[o]), n += s.hlen[o]
					}
					return n
				}

				function g(e, t, a, s, n) {
					var r = j.ht[t],
						i = 0;
					if (0 == t) return i;
					for (var _ = a; _ < s; _ += 2) {
						var o = 0,
							l = 0,
							f = r.xlen,
							c = r.xlen,
							h = 0,
							u = n.l3_enc[_],
							m = n.l3_enc[_ + 1];
						if (0 != u && (n.xr[_] < 0 && h++, o--), 15 < t) {
							if (14 < u) h |= u - 15 << 1, l = f, u = 15;
							if (14 < m) h <<= f, h |= m - 15, l += f, m = 15;
							c = 16
						}
						0 != m && (h <<= 1, n.xr[_ + 1] < 0 && h++, o--), u = u * c + m, l -= o, o += r.hlen[u], v(e, r.table[u], o), v(e,
							h, l), i += o + l
					}
					return i
				}

				function S(e, t) {
					var a = 3 * e.scalefac_band.s[3];
					a > t.big_values && (a = t.big_values);
					var s = g(e, t.table_select[0], 0, a, t);
					return s += g(e, t.table_select[1], a, t.big_values, t)
				}

				function M(e, t) {
					var a, s, n, r;
					a = t.big_values;
					var i = t.region0_count + 1;
					return n = e.scalefac_band.l[i], i += t.region1_count + 1, a < n && (n = a), a < (r = e.scalefac_band.l[i]) && (r =
						a), s = g(e, t.table_select[0], 0, n, t), s += g(e, t.table_select[1], n, r, t), s += g(e, t.table_select[2], r,
						a, t)
				}

				function R() {
					this.total = 0
				}

				function w(e, t) {
					var a, s, n, r, i, _ = e.internal_flags;
					return i = _.w_ptr, -1 == (r = _.h_ptr - 1) && (r = Z.MAX_HEADER_BUF - 1), a = _.header[r].write_timing - l, 0 <=
						(t.total = a) && (s = 1 + r - i, r < i && (s = 1 + r - i + Z.MAX_HEADER_BUF), a -= 8 * s * _.sideinfo_len), a +=
						n = o.getframebits(e), t.total += n, t.total % 8 != 0 ? t.total = 1 + t.total / 8 : t.total = t.total / 8, t.total +=
						b + 1, a < 0 && $.err.println("strange error flushing buffer ... \n"), a
				}
				this.getframebits = function(e) {
					var t, a = e.internal_flags;
					return t = 0 != a.bitrate_index ? j.bitrate_table[e.version][a.bitrate_index] : e.brate, 8 * (0 | 72e3 * (e.version +
						1) * t / e.out_samplerate + a.padding)
				}, this.CRC_writeheader = function(e, t) {
					var a = 65535;
					a = n(255 & t[2], a), a = n(255 & t[3], a);
					for (var s = 6; s < e.sideinfo_len; s++) a = n(255 & t[s], a);
					t[4] = byte(a >> 8), t[5] = byte(255 & a)
				}, this.flush_bitstream = function(e) {
					var t, a, s = e.internal_flags,
						n = s.h_ptr - 1;
					if (-1 == n && (n = Z.MAX_HEADER_BUF - 1), t = s.l3_side, !((a = w(e, new R)) < 0)) {
						if (_(e, a), s.ResvSize = 0, t.main_data_begin = 0, s.findReplayGain) {
							var r = c.GetTitleGain(s.rgdata);
							s.RadioGain = 0 | Math.floor(10 * r + .5)
						}
						s.findPeakSample && (s.noclipGainChange = 0 | Math.ceil(20 * A(s.PeakSample / 32767) * 10), 0 < s.noclipGainChange &&
							(EQ(e.scale, 1) || EQ(e.scale, 0)) ? s.noclipScale = Math.floor(32767 / s.PeakSample * 100) / 100 : s.noclipScale = -
							1)
					}
				}, this.add_dummy_byte = function(e, t, a) {
					for (var s, n = e.internal_flags; 0 < a--;)
						for (i(0, t, 8), s = 0; s < Z.MAX_HEADER_BUF; ++s) n.header[s].write_timing += 8
				}, this.format_bitstream = function(e) {
					var t, a = e.internal_flags;
					t = a.l3_side;
					var s = this.getframebits(e);
					_(e, t.resvDrain_pre),
						function(e, t) {
							var a, s, n, r = e.internal_flags;
							if (a = r.l3_side, r.header[r.h_ptr].ptr = 0, xe.fill(r.header[r.h_ptr].buf, 0, r.sideinfo_len, 0), e.out_samplerate <
								16e3 ? f(r, 4094, 12) : f(r, 4095, 12), f(r, e.version, 1), f(r, 1, 2), f(r, e.error_protection ? 0 : 1, 1), f(
									r, r.bitrate_index, 4), f(r, r.samplerate_index, 2), f(r, r.padding, 1), f(r, e.extension, 1), f(r, e.mode.ordinal(),
									2), f(r, r.mode_ext, 2), f(r, e.copyright, 1), f(r, e.original, 1), f(r, e.emphasis, 2), e.error_protection &&
								f(r, 0, 16), 1 == e.version) {
								for (f(r, a.main_data_begin, 9), 2 == r.channels_out ? f(r, a.private_bits, 3) : f(r, a.private_bits, 5), n =
									0; n < r.channels_out; n++) {
									var i;
									for (i = 0; i < 4; i++) f(r, a.scfsi[n][i], 1)
								}
								for (s = 0; s < 2; s++)
									for (n = 0; n < r.channels_out; n++) f(r, (_ = a.tt[s][n]).part2_3_length + _.part2_length, 12), f(r, _.big_values /
											2, 9), f(r, _.global_gain, 8), f(r, _.scalefac_compress, 4), _.block_type != Pe.NORM_TYPE ? (f(r, 1, 1), f(
											r, _.block_type, 2), f(r, _.mixed_block_flag, 1), 14 == _.table_select[0] && (_.table_select[0] = 16), f(r,
											_.table_select[0], 5), 14 == _.table_select[1] && (_.table_select[1] = 16), f(r, _.table_select[1], 5), f(
											r, _.subblock_gain[0], 3), f(r, _.subblock_gain[1], 3), f(r, _.subblock_gain[2], 3)) : (f(r, 0, 1), 14 == _
											.table_select[0] && (_.table_select[0] = 16), f(r, _.table_select[0], 5), 14 == _.table_select[1] && (_.table_select[
												1] = 16), f(r, _.table_select[1], 5), 14 == _.table_select[2] && (_.table_select[2] = 16), f(r, _.table_select[
												2], 5), f(r, _.region0_count, 4), f(r, _.region1_count, 3)), f(r, _.preflag, 1), f(r, _.scalefac_scale, 1),
										f(r, _.count1table_select, 1)
							} else
								for (f(r, a.main_data_begin, 8), f(r, a.private_bits, r.channels_out), n = s = 0; n < r.channels_out; n++) {
									var _;
									f(r, (_ = a.tt[s][n]).part2_3_length + _.part2_length, 12), f(r, _.big_values / 2, 9), f(r, _.global_gain, 8),
										f(r, _.scalefac_compress, 9), _.block_type != Pe.NORM_TYPE ? (f(r, 1, 1), f(r, _.block_type, 2), f(r, _.mixed_block_flag,
											1), 14 == _.table_select[0] && (_.table_select[0] = 16), f(r, _.table_select[0], 5), 14 == _.table_select[
											1] && (_.table_select[1] = 16), f(r, _.table_select[1], 5), f(r, _.subblock_gain[0], 3), f(r, _.subblock_gain[
											1], 3), f(r, _.subblock_gain[2], 3)) : (f(r, 0, 1), 14 == _.table_select[0] && (_.table_select[0] = 16), f(
												r, _.table_select[0], 5), 14 == _.table_select[1] && (_.table_select[1] = 16), f(r, _.table_select[1], 5),
											14 == _.table_select[2] && (_.table_select[2] = 16), f(r, _.table_select[2], 5), f(r, _.region0_count, 4),
											f(r, _.region1_count, 3)), f(r, _.scalefac_scale, 1), f(r, _.count1table_select, 1)
								}
							e.error_protection && CRC_writeheader(r, r.header[r.h_ptr].buf);
							var o = r.h_ptr;
							r.h_ptr = o + 1 & Z.MAX_HEADER_BUF - 1, r.header[r.h_ptr].write_timing = r.header[o].write_timing + t, r.h_ptr ==
								r.w_ptr && $.err.println("Error: MAX_HEADER_BUF too small in bitstream.c \n")
						}(e, s);
					var n = 8 * a.sideinfo_len;
					if (n += function(e) {
							var t, a, s, n, r = 0,
								i = e.internal_flags,
								_ = i.l3_side;
							if (1 == e.version)
								for (t = 0; t < 2; t++)
									for (a = 0; a < i.channels_out; a++) {
										var o = _.tt[t][a],
											l = T.slen1_tab[o.scalefac_compress],
											f = T.slen2_tab[o.scalefac_compress];
										for (s = n = 0; s < o.sfbdivide; s++) - 1 != o.scalefac[s] && (v(i, o.scalefac[s], l), n += l);
										for (; s < o.sfbmax; s++) - 1 != o.scalefac[s] && (v(i, o.scalefac[s], f), n += f);
										o.block_type == Pe.SHORT_TYPE ? n += S(i, o) : n += M(i, o), r += n += d(i, o)
									} else
										for (a = t = 0; a < i.channels_out; a++) {
											var c, h, u = 0;
											if (h = s = n = 0, (o = _.tt[t][a]).block_type == Pe.SHORT_TYPE) {
												for (; h < 4; h++) {
													var m = o.sfb_partition_table[h] / 3,
														b = o.slen[h];
													for (c = 0; c < m; c++, s++) v(i, Math.max(o.scalefac[3 * s + 0], 0), b), v(i, Math.max(o.scalefac[3 * s +
														1], 0), b), v(i, Math.max(o.scalefac[3 * s + 2], 0), b), u += 3 * b
												}
												n += S(i, o)
											} else {
												for (; h < 4; h++)
													for (m = o.sfb_partition_table[h], b = o.slen[h], c = 0; c < m; c++, s++) v(i, Math.max(o.scalefac[s], 0),
														b), u += b;
												n += M(i, o)
											}
											r += u + (n += d(i, o))
										}
							return r
						}(e), _(e, t.resvDrain_post), n += t.resvDrain_post, t.main_data_begin += (s - n) / 8, w(e, new R) != a.ResvSize &&
						$.err.println("Internal buffer inconsistency. flushbits <> ResvSize"), 8 * t.main_data_begin != a.ResvSize && ($
							.err.printf(
								"bit reservoir error: \nl3_side.main_data_begin: %d \nResvoir size:             %d \nresv drain (post)         %d \nresv drain (pre)          %d \nheader and sideinfo:      %d \ndata bits:                %d \ntotal bits:               %d (remainder: %d) \nbitsperframe:             %d \n",
								8 * t.main_data_begin, a.ResvSize, t.resvDrain_post, t.resvDrain_pre, 8 * a.sideinfo_len, n - t.resvDrain_post -
								8 * a.sideinfo_len, n, n % 8, s), $.err.println("This is a fatal error.  It has several possible causes:"), $.err
							.println("90%%  LAME compiled with buggy version of gcc using advanced optimizations"), $.err.println(
								" 9%%  Your system is overclocked"), $.err.println(" 1%%  bug in LAME encoding library"), a.ResvSize = 8 * t.main_data_begin
						), 1e9 < l) {
						var r;
						for (r = 0; r < Z.MAX_HEADER_BUF; ++r) a.header[r].write_timing -= l;
						l = 0
					}
					return 0
				}, this.copy_buffer = function(e, t, a, s, n) {
					var r = b + 1;
					if (r <= 0) return 0;
					if (0 != s && s < r) return -1;
					if ($.arraycopy(m, 0, t, a, r), b = -1, (p = 0) != n) {
						var i = Be(1);
						if (i[0] = e.nMusicCRC, u.updateMusicCRC(i, t, a, r), e.nMusicCRC = i[0], 0 < r && (e.VBR_seek_table.nBytesWritten +=
								r), e.decode_on_the_fly)
							for (var _, o = Te([2, 1152]), l = r, f = -1; 0 != f;)
								if (f = h.hip_decode1_unclipped(e.hip, t, a, l, o[0], o[1]), l = 0, -1 == f && (f = 0), 0 < f) {
									if (e.findPeakSample) {
										for (_ = 0; _ < f; _++) o[0][_] > e.PeakSample ? e.PeakSample = o[0][_] : -o[0][_] > e.PeakSample && (e.PeakSample = -
											o[0][_]);
										if (1 < e.channels_out)
											for (_ = 0; _ < f; _++) o[1][_] > e.PeakSample ? e.PeakSample = o[1][_] : -o[1][_] > e.PeakSample && (e.PeakSample = -
												o[1][_])
									}
									if (e.findReplayGain && c.AnalyzeSamples(e.rgdata, o[0], 0, o[1], 0, f, e.channels_out) == X.GAIN_ANALYSIS_ERROR)
										return -6
								}
					}
					return r
				}, this.init_bit_stream_w = function(e) {
					m = B(U.LAME_MAXMP3BUFFER), e.h_ptr = e.w_ptr = 0, e.header[e.h_ptr].write_timing = 0, b = -1, l = p = 0
				}
			}

			function e(e, t, a, s) {
				this.xlen = e, this.linmax = t, this.table = a, this.hlen = s
			}
			Ee.STEREO = new Ee(0), Ee.JOINT_STEREO = new Ee(1), Ee.DUAL_CHANNEL = new Ee(2), Ee.MONO = new Ee(3), Ee.NOT_SET =
				new Ee(4), X.STEPS_per_dB = 100, X.MAX_dB = 120, X.GAIN_NOT_ENOUGH_SAMPLES = -24601, X.GAIN_ANALYSIS_ERROR = 0, X.GAIN_ANALYSIS_OK =
				1, X.INIT_GAIN_ANALYSIS_ERROR = 0, X.INIT_GAIN_ANALYSIS_OK = 1, X.MAX_ORDER = X.YULE_ORDER = 10, X.MAX_SAMPLES_PER_WINDOW =
				(X.MAX_SAMP_FREQ = 48e3) * (X.RMS_WINDOW_TIME_NUMERATOR = 1) / (X.RMS_WINDOW_TIME_DENOMINATOR = 20) + 1, M.NUMTOCENTRIES =
				100, M.MAXFRAMESIZE = 2880, q.EQ = function(e, t) {
					return Math.abs(e) > Math.abs(t) ? Math.abs(e - t) <= 1e-6 * Math.abs(e) : Math.abs(e - t) <= 1e-6 * Math.abs(t)
				}, q.NEQ = function(e, t) {
					return !q.EQ(e, t)
				};
			var j = {};

			function F(e) {
				this.bits = e
			}

			function x() {
				this.over_noise = 0, this.tot_noise = 0, this.max_noise = 0, this.over_count = 0, this.over_SSD = 0, this.bits = 0
			}

			function r(e, t, a, s) {
				this.l = Be(1 + Pe.SBMAX_l), this.s = Be(1 + Pe.SBMAX_s), this.psfb21 = Be(1 + Pe.PSFB21), this.psfb12 = Be(1 + Pe.PSFB12);
				var n = this.l,
					r = this.s;
				4 == arguments.length && (this.arrL = e, this.arrS = t, this.arr21 = a, this.arr12 = s, $.arraycopy(this.arrL, 0, n,
					0, Math.min(this.arrL.length, this.l.length)), $.arraycopy(this.arrS, 0, r, 0, Math.min(this.arrS.length, this.s
					.length)), $.arraycopy(this.arr21, 0, this.psfb21, 0, Math.min(this.arr21.length, this.psfb21.length)), $.arraycopy(
					this.arr12, 0, this.psfb12, 0, Math.min(this.arr12.length, this.psfb12.length)))
			}

			function y() {
				var l = null,
					m = null,
					s = null;
				this.setModules = function(e, t, a) {
					l = e, m = t, s = a
				}, this.IPOW20 = function(e) {
					return u[e]
				};
				var k = 2.220446049250313e-16,
					f = y.IXMAX_VAL + 2,
					c = y.Q_MAX,
					h = y.Q_MAX2,
					n = 100;
				this.nr_of_sfb_block = [
					[
						[6, 5, 5, 5],
						[9, 9, 9, 9],
						[6, 9, 9, 9]
					],
					[
						[6, 5, 7, 3],
						[9, 9, 12, 6],
						[6, 9, 12, 6]
					],
					[
						[11, 10, 0, 0],
						[18, 18, 0, 0],
						[15, 18, 0, 0]
					],
					[
						[7, 7, 7, 0],
						[12, 12, 12, 0],
						[6, 15, 12, 0]
					],
					[
						[6, 6, 6, 3],
						[12, 9, 9, 6],
						[6, 12, 9, 6]
					],
					[
						[8, 8, 5, 0],
						[15, 12, 9, 0],
						[6, 18, 9, 0]
					]
				];
				var R = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 0];
				this.pretab = R, this.sfBandIndex = [new r([0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140, 168, 200, 238,
					284, 336, 396, 464, 522, 576
				], [0, 4, 8, 12, 18, 24, 32, 42, 56, 74, 100, 132, 174, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r(
					[0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 114, 136, 162, 194, 232, 278, 332, 394, 464, 540, 576], [0, 4, 8,
						12, 18, 26, 36, 48, 62, 80, 104, 136, 180, 192
					], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r([0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140,
					168, 200, 238, 284, 336, 396, 464, 522, 576
				], [0, 4, 8, 12, 18, 26, 36, 48, 62, 80, 104, 134, 174, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r(
					[0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 52, 62, 74, 90, 110, 134, 162, 196, 238, 288, 342, 418, 576], [0, 4, 8, 12,
						16, 22, 30, 40, 52, 66, 84, 106, 136, 192
					], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r([0, 4, 8, 12, 16, 20, 24, 30, 36, 42, 50, 60, 72, 88,
					106, 128, 156, 190, 230, 276, 330, 384, 576
				], [0, 4, 8, 12, 16, 22, 28, 38, 50, 64, 80, 100, 126, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r(
					[0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 54, 66, 82, 102, 126, 156, 194, 240, 296, 364, 448, 550, 576], [0, 4, 8,
						12, 16, 22, 30, 42, 58, 78, 104, 138, 180, 192
					], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r([0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140,
					168, 200, 238, 284, 336, 396, 464, 522, 576
				], [0, 4, 8, 12, 18, 26, 36, 48, 62, 80, 104, 134, 174, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r(
					[0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140, 168, 200, 238, 284, 336, 396, 464, 522, 576], [0, 4, 8,
						12, 18, 26, 36, 48, 62, 80, 104, 134, 174, 192
					], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]), new r([0, 12, 24, 36, 48, 60, 72, 88, 108, 132, 160, 192, 232,
					280, 336, 400, 476, 566, 568, 570, 572, 574, 576
				], [0, 8, 16, 24, 36, 52, 72, 96, 124, 160, 162, 164, 166, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0])];
				var w = Ae(c + h + 1),
					u = Ae(c),
					b = Ae(f),
					p = Ae(f);

				function v(e, t) {
					var a = s.ATHformula(t, e);
					return a -= n, a = Math.pow(10, a / 10 + e.ATHlower)
				}

				function B(e) {
					this.s = e
				}
				this.adj43 = p, this.iteration_init = function(e) {
					var t, a = e.internal_flags,
						s = a.l3_side;
					if (0 == a.iteration_init_init) {
						for (a.iteration_init_init = 1, s.main_data_begin = 0, function(e) {
								for (var t = e.internal_flags.ATH.l, a = e.internal_flags.ATH.psfb21, s = e.internal_flags.ATH.s, n = e.internal_flags
										.ATH.psfb12, r = e.internal_flags, i = e.out_samplerate, _ = 0; _ < Pe.SBMAX_l; _++) {
									var o = r.scalefac_band.l[_],
										l = r.scalefac_band.l[_ + 1];
									t[_] = K.MAX_VALUE;
									for (var f = o; f < l; f++) {
										var c = v(e, f * i / 1152);
										t[_] = Math.min(t[_], c)
									}
								}
								for (_ = 0; _ < Pe.PSFB21; _++)
									for (o = r.scalefac_band.psfb21[_], l = r.scalefac_band.psfb21[_ + 1], a[_] = K.MAX_VALUE, f = o; f < l; f++)
										c = v(e, f * i / 1152), a[_] = Math.min(a[_], c);
								for (_ = 0; _ < Pe.SBMAX_s; _++) {
									for (o = r.scalefac_band.s[_], l = r.scalefac_band.s[_ + 1], s[_] = K.MAX_VALUE, f = o; f < l; f++) c = v(e,
										f * i / 384), s[_] = Math.min(s[_], c);
									s[_] *= r.scalefac_band.s[_ + 1] - r.scalefac_band.s[_]
								}
								for (_ = 0; _ < Pe.PSFB12; _++) {
									for (o = r.scalefac_band.psfb12[_], l = r.scalefac_band.psfb12[_ + 1], n[_] = K.MAX_VALUE, f = o; f < l; f++)
										c = v(e, f * i / 384), n[_] = Math.min(n[_], c);
									n[_] *= r.scalefac_band.s[13] - r.scalefac_band.s[12]
								}
								if (e.noATH) {
									for (_ = 0; _ < Pe.SBMAX_l; _++) t[_] = 1e-20;
									for (_ = 0; _ < Pe.PSFB21; _++) a[_] = 1e-20;
									for (_ = 0; _ < Pe.SBMAX_s; _++) s[_] = 1e-20;
									for (_ = 0; _ < Pe.PSFB12; _++) n[_] = 1e-20
								}
								r.ATH.floor = 10 * A(v(e, -1))
							}(e), b[0] = 0, t = 1; t < f; t++) b[t] = Math.pow(t, 4 / 3);
						for (t = 0; t < f - 1; t++) p[t] = t + 1 - Math.pow(.5 * (b[t] + b[t + 1]), .75);
						for (p[t] = .5, t = 0; t < c; t++) u[t] = Math.pow(2, -.1875 * (t - 210));
						for (t = 0; t <= c + h; t++) w[t] = Math.pow(2, .25 * (t - 210 - h));
						var n, r, i, _;
						for (l.huffman_init(a), 32 <= (t = e.exp_nspsytune >> 2 & 63) && (t -= 64), n = Math.pow(10, t / 4 / 10), 32 <=
							(t = e.exp_nspsytune >> 8 & 63) && (t -= 64), r = Math.pow(10, t / 4 / 10), 32 <= (t = e.exp_nspsytune >> 14 &
								63) && (t -= 64), i = Math.pow(10, t / 4 / 10), 32 <= (t = e.exp_nspsytune >> 20 & 63) && (t -= 64), _ = i *
							Math.pow(10, t / 4 / 10), t = 0; t < Pe.SBMAX_l; t++) {
							o = t <= 6 ? n : t <= 13 ? r : t <= 20 ? i : _, a.nsPsy.longfact[t] = o
						}
						for (t = 0; t < Pe.SBMAX_s; t++) {
							var o;
							o = t <= 5 ? n : t <= 10 ? r : t <= 11 ? i : _, a.nsPsy.shortfact[t] = o
						}
					}
				}, this.on_pe = function(e, t, a, s, n, r) {
					var i, _, o = e.internal_flags,
						l = 0,
						f = Be(2),
						c = new F(l),
						h = m.ResvMaxBits(e, s, c, r),
						u = (l = c.bits) + h;
					for (Z.MAX_BITS_PER_GRANULE < u && (u = Z.MAX_BITS_PER_GRANULE), _ = i = 0; _ < o.channels_out; ++_) a[_] = Math.min(
						Z.MAX_BITS_PER_CHANNEL, l / o.channels_out), f[_] = 0 | a[_] * t[n][_] / 700 - a[_], f[_] > 3 * s / 4 && (f[_] =
						3 * s / 4), f[_] < 0 && (f[_] = 0), f[_] + a[_] > Z.MAX_BITS_PER_CHANNEL && (f[_] = Math.max(0, Z.MAX_BITS_PER_CHANNEL -
						a[_])), i += f[_];
					if (h < i)
						for (_ = 0; _ < o.channels_out; ++_) f[_] = h * f[_] / i;
					for (_ = 0; _ < o.channels_out; ++_) a[_] += f[_], h -= f[_];
					for (_ = i = 0; _ < o.channels_out; ++_) i += a[_];
					if (Z.MAX_BITS_PER_GRANULE < i) {
						for (_ = 0; _ < o.channels_out; ++_) a[_] *= Z.MAX_BITS_PER_GRANULE, a[_] /= i, a[_]
					}
					return u
				}, this.reduce_side = function(e, t, a, s) {
					var n = .33 * (.5 - t) / .5;
					n < 0 && (n = 0), .5 < n && (n = .5);
					var r = 0 | .5 * n * (e[0] + e[1]);
					r > Z.MAX_BITS_PER_CHANNEL - e[0] && (r = Z.MAX_BITS_PER_CHANNEL - e[0]), r < 0 && (r = 0), 125 <= e[1] && (125 <
						e[1] - r ? (e[0] < a && (e[0] += r), e[1] -= r) : (e[0] += e[1] - 125, e[1] = 125)), s < (r = e[0] + e[1]) && (
						e[0] = s * e[0] / r, e[1] = s * e[1] / r)
				}, this.athAdjust = function(e, t, a) {
					var s = 90.30873362,
						n = ee.FAST_LOG10_X(t, 10),
						r = e * e,
						i = 0;
					return n -= a, 1e-20 < r && (i = 1 + ee.FAST_LOG10_X(r, 10 / s)), i < 0 && (i = 0), n *= i, n += a + s -
						94.82444863, Math.pow(10, .1 * n)
				}, this.calc_xmin = function(e, t, a, s) {
					var n, r = 0,
						i = e.internal_flags,
						_ = 0,
						o = 0,
						l = i.ATH,
						f = a.xr,
						c = e.VBR == ye.vbr_mtrh ? 1 : 0,
						h = i.masking_lower;
					for (e.VBR != ye.vbr_mtrh && e.VBR != ye.vbr_mt || (h = 1), n = 0; n < a.psy_lmax; n++) {
						S = (g = e.VBR == ye.vbr_rh || e.VBR == ye.vbr_mtrh ? athAdjust(l.adjust, l.l[n], l.floor) : l.adjust * l.l[n]) /
							(p = a.width[n]), M = k, A = p >> 1, B = 0;
						do {
							B += T = f[_] * f[_], M += T < S ? T : S, B += x = f[++_] * f[_], M += x < S ? x : S, _++
						} while (0 < --A);
						if (g < B && o++, n == Pe.SBPSY_l) M < (w = g * i.nsPsy.longfact[n]) && (M = w);
						if (0 != c && (g = M), !e.ATHonly)
							if (0 < (R = t.en.l[n])) w = B * t.thm.l[n] * h / R, 0 != c && (w *= i.nsPsy.longfact[n]), g < w && (g = w);
						s[r++] = 0 != c ? g : g * i.nsPsy.longfact[n]
					}
					var u = 575;
					if (a.block_type != Pe.SHORT_TYPE)
						for (var m = 576; 0 != m-- && q.EQ(f[m], 0);) u = m;
					a.max_nonzero_coeff = u;
					for (var b = a.sfb_smin; n < a.psymax; b++, n += 3) {
						var p, v, d;
						for (d = e.VBR == ye.vbr_rh || e.VBR == ye.vbr_mtrh ? athAdjust(l.adjust, l.s[b], l.floor) : l.adjust * l.s[b],
							p = a.width[n], v = 0; v < 3; v++) {
							var g, S, M, R, w, B = 0,
								A = p >> 1;
							S = d / p, M = k;
							do {
								var T, x;
								B += T = f[_] * f[_], M += T < S ? T : S, B += x = f[++_] * f[_], M += x < S ? x : S, _++
							} while (0 < --A);
							if (d < B && o++, b == Pe.SBPSY_s) M < (w = d * i.nsPsy.shortfact[b]) && (M = w);
							if (g = 0 != c ? M : d, !e.ATHonly && !e.ATHshort)
								if (0 < (R = t.en.s[b][v])) w = B * t.thm.s[b][v] * h / R, 0 != c && (w *= i.nsPsy.shortfact[b]), g < w && (g =
									w);
							s[r++] = 0 != c ? g : g * i.nsPsy.shortfact[b]
						}
						e.useTemporal && (s[r - 3] > s[r - 3 + 1] && (s[r - 3 + 1] += (s[r - 3] - s[r - 3 + 1]) * i.decay), s[r - 3 + 1] >
							s[r - 3 + 2] && (s[r - 3 + 2] += (s[r - 3 + 1] - s[r - 3 + 2]) * i.decay))
					}
					return o
				}, this.calc_noise_core = function(e, t, a, s) {
					var n = 0,
						r = t.s,
						i = e.l3_enc;
					if (r > e.count1)
						for (; 0 != a--;) {
							o = e.xr[r], r++, n += o * o, o = e.xr[r], r++, n += o * o
						} else if (r > e.big_values) {
							var _ = Ae(2);
							for (_[0] = 0, _[1] = s; 0 != a--;) {
								o = Math.abs(e.xr[r]) - _[i[r]], r++, n += o * o, o = Math.abs(e.xr[r]) - _[i[r]], r++, n += o * o
							}
						} else
							for (; 0 != a--;) {
								var o;
								o = Math.abs(e.xr[r]) - b[i[r]] * s, r++, n += o * o, o = Math.abs(e.xr[r]) - b[i[r]] * s, r++, n += o * o
							}
					return t.s = r, n
				}, this.calc_noise = function(e, t, a, s, n) {
					var r, i, _ = 0,
						o = 0,
						l = 0,
						f = 0,
						c = 0,
						h = -20,
						u = 0,
						m = e.scalefac,
						b = 0;
					for (r = s.over_SSD = 0; r < e.psymax; r++) {
						var p, v = e.global_gain - (m[b++] + (0 != e.preflag ? R[r] : 0) << e.scalefac_scale + 1) - 8 * e.subblock_gain[
								e.window[r]],
							d = 0;
						if (null != n && n.step[r] == v) d = n.noise[r], u += e.width[r], a[_++] = d / t[o++], d = n.noise_log[r];
						else {
							var g, S = w[v + y.Q_MAX2];
							if (i = e.width[r] >> 1, u + e.width[r] > e.max_nonzero_coeff) i = 0 < (g = e.max_nonzero_coeff - u + 1) ? g >>
								1 : 0;
							var M = new B(u);
							d = this.calc_noise_core(e, M, i, S), u = M.s, null != n && (n.step[r] = v, n.noise[r] = d), d = a[_++] = d / t[
								o++], d = ee.FAST_LOG10(Math.max(d, 1e-20)), null != n && (n.noise_log[r] = d)
						}
						if (null != n && (n.global_gain = e.global_gain), c += d, 0 < d) p = Math.max(0 | 10 * d + .5, 1), s.over_SSD +=
							p * p, l++, f += d;
						h = Math.max(h, d)
					}
					return s.over_count = l, s.tot_noise = c, s.over_noise = f, s.max_noise = h, l
				}, this.set_pinfo = function(e, t, a, s, n) {
					var r, i, _, o, l, f = e.internal_flags,
						c = 0 == t.scalefac_scale ? .5 : 1,
						h = t.scalefac,
						u = Ae(z.SFBMAX),
						m = Ae(z.SFBMAX),
						b = new x;
					calc_xmin(e, a, t, u), calc_noise(t, u, m, b, null);
					var p = 0;
					for (i = t.sfb_lmax, t.block_type != Pe.SHORT_TYPE && 0 == t.mixed_block_flag && (i = 22), r = 0; r < i; r++) {
						var v = f.scalefac_band.l[r],
							d = (g = f.scalefac_band.l[r + 1]) - v;
						for (o = 0; p < g; p++) o += t.xr[p] * t.xr[p];
						o /= d, l = 1e15, f.pinfo.en[s][n][r] = l * o, f.pinfo.xfsf[s][n][r] = l * u[r] * m[r] / d, 0 < a.en.l[r] && !e.ATHonly ?
							o /= a.en.l[r] : o = 0, f.pinfo.thr[s][n][r] = l * Math.max(o * a.thm.l[r], f.ATH.l[r]), (f.pinfo.LAMEsfb[s][n]
								[r] = 0) != t.preflag && 11 <= r && (f.pinfo.LAMEsfb[s][n][r] = -c * R[r]), r < Pe.SBPSY_l && (f.pinfo.LAMEsfb[
								s][n][r] -= c * h[r])
					}
					if (t.block_type == Pe.SHORT_TYPE)
						for (i = r, r = t.sfb_smin; r < Pe.SBMAX_s; r++) {
							v = f.scalefac_band.s[r], d = (g = f.scalefac_band.s[r + 1]) - v;
							for (var g, S = 0; S < 3; S++) {
								for (o = 0, _ = v; _ < g; _++) o += t.xr[p] * t.xr[p], p++;
								o = Math.max(o / d, 1e-20), l = 1e15, f.pinfo.en_s[s][n][3 * r + S] = l * o, f.pinfo.xfsf_s[s][n][3 * r + S] =
									l * u[i] * m[i] / d, 0 < a.en.s[r][S] ? o /= a.en.s[r][S] : o = 0, (e.ATHonly || e.ATHshort) && (o = 0), f.pinfo
									.thr_s[s][n][3 * r + S] = l * Math.max(o * a.thm.s[r][S], f.ATH.s[r]), f.pinfo.LAMEsfb_s[s][n][3 * r + S] = -
									2 * t.subblock_gain[S], r < Pe.SBPSY_s && (f.pinfo.LAMEsfb_s[s][n][3 * r + S] -= c * h[i]), i++
							}
						}
					f.pinfo.LAMEqss[s][n] = t.global_gain, f.pinfo.LAMEmainbits[s][n] = t.part2_3_length + t.part2_length, f.pinfo.LAMEsfbits[
						s][n] = t.part2_length, f.pinfo.over[s][n] = b.over_count, f.pinfo.max_noise[s][n] = 10 * b.max_noise, f.pinfo.over_noise[
						s][n] = 10 * b.over_noise, f.pinfo.tot_noise[s][n] = 10 * b.tot_noise, f.pinfo.over_SSD[s][n] = b.over_SSD
				}
			}

			function k() {
				this.xr = Ae(576), this.l3_enc = Be(576), this.scalefac = Be(z.SFBMAX), this.xrpow_max = 0, this.part2_3_length = 0,
					this.big_values = 0, this.count1 = 0, this.global_gain = 0, this.scalefac_compress = 0, this.block_type = 0, this.mixed_block_flag =
					0, this.table_select = Be(3), this.subblock_gain = Be(4), this.region0_count = 0, this.region1_count = 0, this.preflag =
					0, this.scalefac_scale = 0, this.count1table_select = 0, this.part2_length = 0, this.sfb_lmax = 0, this.sfb_smin =
					0, this.psy_lmax = 0, this.sfbmax = 0, this.psymax = 0, this.sfbdivide = 0, this.width = Be(z.SFBMAX), this.window =
					Be(z.SFBMAX), this.count1bits = 0, this.sfb_partition_table = null, this.slen = Be(4), this.max_nonzero_coeff = 0;
				var a = this;

				function s(e) {
					return new Int32Array(e)
				}
				this.assign = function(e) {
					var t;
					a.xr = (t = e.xr, new Float32Array(t)), a.l3_enc = s(e.l3_enc), a.scalefac = s(e.scalefac), a.xrpow_max = e.xrpow_max,
						a.part2_3_length = e.part2_3_length, a.big_values = e.big_values, a.count1 = e.count1, a.global_gain = e.global_gain,
						a.scalefac_compress = e.scalefac_compress, a.block_type = e.block_type, a.mixed_block_flag = e.mixed_block_flag,
						a.table_select = s(e.table_select), a.subblock_gain = s(e.subblock_gain), a.region0_count = e.region0_count, a.region1_count =
						e.region1_count, a.preflag = e.preflag, a.scalefac_scale = e.scalefac_scale, a.count1table_select = e.count1table_select,
						a.part2_length = e.part2_length, a.sfb_lmax = e.sfb_lmax, a.sfb_smin = e.sfb_smin, a.psy_lmax = e.psy_lmax, a.sfbmax =
						e.sfbmax, a.psymax = e.psymax, a.sfbdivide = e.sfbdivide, a.width = s(e.width), a.window = s(e.window), a.count1bits =
						e.count1bits, a.sfb_partition_table = e.sfb_partition_table.slice(0), a.slen = s(e.slen), a.max_nonzero_coeff =
						e.max_nonzero_coeff
				}
			}
			j.t1HB = [1, 1, 1, 0], j.t2HB = [1, 2, 1, 3, 1, 1, 3, 2, 0], j.t3HB = [3, 2, 1, 1, 1, 1, 3, 2, 0], j.t5HB = [1, 2, 6,
				5, 3, 1, 4, 4, 7, 5, 7, 1, 6, 1, 1, 0
			], j.t6HB = [7, 3, 5, 1, 6, 2, 3, 2, 5, 4, 4, 1, 3, 3, 2, 0], j.t7HB = [1, 2, 10, 19, 16, 10, 3, 3, 7, 10, 5, 3, 11,
				4, 13, 17, 8, 4, 12, 11, 18, 15, 11, 2, 7, 6, 9, 14, 3, 1, 6, 4, 5, 3, 2, 0
			], j.t8HB = [3, 4, 6, 18, 12, 5, 5, 1, 2, 16, 9, 3, 7, 3, 5, 14, 7, 3, 19, 17, 15, 13, 10, 4, 13, 5, 8, 11, 5, 1,
				12, 4, 4, 1, 1, 0
			], j.t9HB = [7, 5, 9, 14, 15, 7, 6, 4, 5, 5, 6, 7, 7, 6, 8, 8, 8, 5, 15, 6, 9, 10, 5, 1, 11, 7, 9, 6, 4, 1, 14, 4,
				6, 2, 6, 0
			], j.t10HB = [1, 2, 10, 23, 35, 30, 12, 17, 3, 3, 8, 12, 18, 21, 12, 7, 11, 9, 15, 21, 32, 40, 19, 6, 14, 13, 22,
				34, 46, 23, 18, 7, 20, 19, 33, 47, 27, 22, 9, 3, 31, 22, 41, 26, 21, 20, 5, 3, 14, 13, 10, 11, 16, 6, 5, 1, 9, 8,
				7, 8, 4, 4, 2, 0
			], j.t11HB = [3, 4, 10, 24, 34, 33, 21, 15, 5, 3, 4, 10, 32, 17, 11, 10, 11, 7, 13, 18, 30, 31, 20, 5, 25, 11, 19,
				59, 27, 18, 12, 5, 35, 33, 31, 58, 30, 16, 7, 5, 28, 26, 32, 19, 17, 15, 8, 14, 14, 12, 9, 13, 14, 9, 4, 1, 11, 4,
				6, 6, 6, 3, 2, 0
			], j.t12HB = [9, 6, 16, 33, 41, 39, 38, 26, 7, 5, 6, 9, 23, 16, 26, 11, 17, 7, 11, 14, 21, 30, 10, 7, 17, 10, 15,
				12, 18, 28, 14, 5, 32, 13, 22, 19, 18, 16, 9, 5, 40, 17, 31, 29, 17, 13, 4, 2, 27, 12, 11, 15, 10, 7, 4, 1, 27, 12,
				8, 12, 6, 3, 1, 0
			], j.t13HB = [1, 5, 14, 21, 34, 51, 46, 71, 42, 52, 68, 52, 67, 44, 43, 19, 3, 4, 12, 19, 31, 26, 44, 33, 31, 24,
				32, 24, 31, 35, 22, 14, 15, 13, 23, 36, 59, 49, 77, 65, 29, 40, 30, 40, 27, 33, 42, 16, 22, 20, 37, 61, 56, 79, 73,
				64, 43, 76, 56, 37, 26, 31, 25, 14, 35, 16, 60, 57, 97, 75, 114, 91, 54, 73, 55, 41, 48, 53, 23, 24, 58, 27, 50,
				96, 76, 70, 93, 84, 77, 58, 79, 29, 74, 49, 41, 17, 47, 45, 78, 74, 115, 94, 90, 79, 69, 83, 71, 50, 59, 38, 36,
				15, 72, 34, 56, 95, 92, 85, 91, 90, 86, 73, 77, 65, 51, 44, 43, 42, 43, 20, 30, 44, 55, 78, 72, 87, 78, 61, 46, 54,
				37, 30, 20, 16, 53, 25, 41, 37, 44, 59, 54, 81, 66, 76, 57, 54, 37, 18, 39, 11, 35, 33, 31, 57, 42, 82, 72, 80, 47,
				58, 55, 21, 22, 26, 38, 22, 53, 25, 23, 38, 70, 60, 51, 36, 55, 26, 34, 23, 27, 14, 9, 7, 34, 32, 28, 39, 49, 75,
				30, 52, 48, 40, 52, 28, 18, 17, 9, 5, 45, 21, 34, 64, 56, 50, 49, 45, 31, 19, 12, 15, 10, 7, 6, 3, 48, 23, 20, 39,
				36, 35, 53, 21, 16, 23, 13, 10, 6, 1, 4, 2, 16, 15, 17, 27, 25, 20, 29, 11, 17, 12, 16, 8, 1, 1, 0, 1
			], j.t15HB = [7, 12, 18, 53, 47, 76, 124, 108, 89, 123, 108, 119, 107, 81, 122, 63, 13, 5, 16, 27, 46, 36, 61, 51,
				42, 70, 52, 83, 65, 41, 59, 36, 19, 17, 15, 24, 41, 34, 59, 48, 40, 64, 50, 78, 62, 80, 56, 33, 29, 28, 25, 43, 39,
				63, 55, 93, 76, 59, 93, 72, 54, 75, 50, 29, 52, 22, 42, 40, 67, 57, 95, 79, 72, 57, 89, 69, 49, 66, 46, 27, 77, 37,
				35, 66, 58, 52, 91, 74, 62, 48, 79, 63, 90, 62, 40, 38, 125, 32, 60, 56, 50, 92, 78, 65, 55, 87, 71, 51, 73, 51,
				70, 30, 109, 53, 49, 94, 88, 75, 66, 122, 91, 73, 56, 42, 64, 44, 21, 25, 90, 43, 41, 77, 73, 63, 56, 92, 77, 66,
				47, 67, 48, 53, 36, 20, 71, 34, 67, 60, 58, 49, 88, 76, 67, 106, 71, 54, 38, 39, 23, 15, 109, 53, 51, 47, 90, 82,
				58, 57, 48, 72, 57, 41, 23, 27, 62, 9, 86, 42, 40, 37, 70, 64, 52, 43, 70, 55, 42, 25, 29, 18, 11, 11, 118, 68, 30,
				55, 50, 46, 74, 65, 49, 39, 24, 16, 22, 13, 14, 7, 91, 44, 39, 38, 34, 63, 52, 45, 31, 52, 28, 19, 14, 8, 9, 3,
				123, 60, 58, 53, 47, 43, 32, 22, 37, 24, 17, 12, 15, 10, 2, 1, 71, 37, 34, 30, 28, 20, 17, 26, 21, 16, 10, 6, 8, 6,
				2, 0
			], j.t16HB = [1, 5, 14, 44, 74, 63, 110, 93, 172, 149, 138, 242, 225, 195, 376, 17, 3, 4, 12, 20, 35, 62, 53, 47,
				83, 75, 68, 119, 201, 107, 207, 9, 15, 13, 23, 38, 67, 58, 103, 90, 161, 72, 127, 117, 110, 209, 206, 16, 45, 21,
				39, 69, 64, 114, 99, 87, 158, 140, 252, 212, 199, 387, 365, 26, 75, 36, 68, 65, 115, 101, 179, 164, 155, 264, 246,
				226, 395, 382, 362, 9, 66, 30, 59, 56, 102, 185, 173, 265, 142, 253, 232, 400, 388, 378, 445, 16, 111, 54, 52, 100,
				184, 178, 160, 133, 257, 244, 228, 217, 385, 366, 715, 10, 98, 48, 91, 88, 165, 157, 148, 261, 248, 407, 397, 372,
				380, 889, 884, 8, 85, 84, 81, 159, 156, 143, 260, 249, 427, 401, 392, 383, 727, 713, 708, 7, 154, 76, 73, 141, 131,
				256, 245, 426, 406, 394, 384, 735, 359, 710, 352, 11, 139, 129, 67, 125, 247, 233, 229, 219, 393, 743, 737, 720,
				885, 882, 439, 4, 243, 120, 118, 115, 227, 223, 396, 746, 742, 736, 721, 712, 706, 223, 436, 6, 202, 224, 222, 218,
				216, 389, 386, 381, 364, 888, 443, 707, 440, 437, 1728, 4, 747, 211, 210, 208, 370, 379, 734, 723, 714, 1735, 883,
				877, 876, 3459, 865, 2, 377, 369, 102, 187, 726, 722, 358, 711, 709, 866, 1734, 871, 3458, 870, 434, 0, 12, 10, 7,
				11, 10, 17, 11, 9, 13, 12, 10, 7, 5, 3, 1, 3
			], j.t24HB = [15, 13, 46, 80, 146, 262, 248, 434, 426, 669, 653, 649, 621, 517, 1032, 88, 14, 12, 21, 38, 71, 130,
				122, 216, 209, 198, 327, 345, 319, 297, 279, 42, 47, 22, 41, 74, 68, 128, 120, 221, 207, 194, 182, 340, 315, 295,
				541, 18, 81, 39, 75, 70, 134, 125, 116, 220, 204, 190, 178, 325, 311, 293, 271, 16, 147, 72, 69, 135, 127, 118,
				112, 210, 200, 188, 352, 323, 306, 285, 540, 14, 263, 66, 129, 126, 119, 114, 214, 202, 192, 180, 341, 317, 301,
				281, 262, 12, 249, 123, 121, 117, 113, 215, 206, 195, 185, 347, 330, 308, 291, 272, 520, 10, 435, 115, 111, 109,
				211, 203, 196, 187, 353, 332, 313, 298, 283, 531, 381, 17, 427, 212, 208, 205, 201, 193, 186, 177, 169, 320, 303,
				286, 268, 514, 377, 16, 335, 199, 197, 191, 189, 181, 174, 333, 321, 305, 289, 275, 521, 379, 371, 11, 668, 184,
				183, 179, 175, 344, 331, 314, 304, 290, 277, 530, 383, 373, 366, 10, 652, 346, 171, 168, 164, 318, 309, 299, 287,
				276, 263, 513, 375, 368, 362, 6, 648, 322, 316, 312, 307, 302, 292, 284, 269, 261, 512, 376, 370, 364, 359, 4, 620,
				300, 296, 294, 288, 282, 273, 266, 515, 380, 374, 369, 365, 361, 357, 2, 1033, 280, 278, 274, 267, 264, 259, 382,
				378, 372, 367, 363, 360, 358, 356, 0, 43, 20, 19, 17, 15, 13, 11, 9, 7, 6, 4, 7, 5, 3, 1, 3
			], j.t32HB = [1, 10, 8, 20, 12, 20, 16, 32, 14, 12, 24, 0, 28, 16, 24, 16], j.t33HB = [15, 28, 26, 48, 22, 40, 36,
				64, 14, 24, 20, 32, 12, 16, 8, 0
			], j.t1l = [1, 4, 3, 5], j.t2l = [1, 4, 7, 4, 5, 7, 6, 7, 8], j.t3l = [2, 3, 7, 4, 4, 7, 6, 7, 8], j.t5l = [1, 4, 7,
				8, 4, 5, 8, 9, 7, 8, 9, 10, 8, 8, 9, 10
			], j.t6l = [3, 4, 6, 8, 4, 4, 6, 7, 5, 6, 7, 8, 7, 7, 8, 9], j.t7l = [1, 4, 7, 9, 9, 10, 4, 6, 8, 9, 9, 10, 7, 7, 9,
				10, 10, 11, 8, 9, 10, 11, 11, 11, 8, 9, 10, 11, 11, 12, 9, 10, 11, 12, 12, 12
			], j.t8l = [2, 4, 7, 9, 9, 10, 4, 4, 6, 10, 10, 10, 7, 6, 8, 10, 10, 11, 9, 10, 10, 11, 11, 12, 9, 9, 10, 11, 12,
				12, 10, 10, 11, 11, 13, 13
			], j.t9l = [3, 4, 6, 7, 9, 10, 4, 5, 6, 7, 8, 10, 5, 6, 7, 8, 9, 10, 7, 7, 8, 9, 9, 10, 8, 8, 9, 9, 10, 11, 9, 9,
				10, 10, 11, 11
			], j.t10l = [1, 4, 7, 9, 10, 10, 10, 11, 4, 6, 8, 9, 10, 11, 10, 10, 7, 8, 9, 10, 11, 12, 11, 11, 8, 9, 10, 11, 12,
				12, 11, 12, 9, 10, 11, 12, 12, 12, 12, 12, 10, 11, 12, 12, 13, 13, 12, 13, 9, 10, 11, 12, 12, 12, 13, 13, 10, 10,
				11, 12, 12, 13, 13, 13
			], j.t11l = [2, 4, 6, 8, 9, 10, 9, 10, 4, 5, 6, 8, 10, 10, 9, 10, 6, 7, 8, 9, 10, 11, 10, 10, 8, 8, 9, 11, 10, 12,
				10, 11, 9, 10, 10, 11, 11, 12, 11, 12, 9, 10, 11, 12, 12, 13, 12, 13, 9, 9, 9, 10, 11, 12, 12, 12, 9, 9, 10, 11,
				12, 12, 12, 12
			], j.t12l = [4, 4, 6, 8, 9, 10, 10, 10, 4, 5, 6, 7, 9, 9, 10, 10, 6, 6, 7, 8, 9, 10, 9, 10, 7, 7, 8, 8, 9, 10, 10,
				10, 8, 8, 9, 9, 10, 10, 10, 11, 9, 9, 10, 10, 10, 11, 10, 11, 9, 9, 9, 10, 10, 11, 11, 12, 10, 10, 10, 11, 11, 11,
				11, 12
			], j.t13l = [1, 5, 7, 8, 9, 10, 10, 11, 10, 11, 12, 12, 13, 13, 14, 14, 4, 6, 8, 9, 10, 10, 11, 11, 11, 11, 12, 12,
				13, 14, 14, 14, 7, 8, 9, 10, 11, 11, 12, 12, 11, 12, 12, 13, 13, 14, 15, 15, 8, 9, 10, 11, 11, 12, 12, 12, 12, 13,
				13, 13, 13, 14, 15, 15, 9, 9, 11, 11, 12, 12, 13, 13, 12, 13, 13, 14, 14, 15, 15, 16, 10, 10, 11, 12, 12, 12, 13,
				13, 13, 13, 14, 13, 15, 15, 16, 16, 10, 11, 12, 12, 13, 13, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 11, 11, 12, 13,
				13, 13, 14, 14, 14, 14, 15, 15, 15, 16, 18, 18, 10, 10, 11, 12, 12, 13, 13, 14, 14, 14, 14, 15, 15, 16, 17, 17, 11,
				11, 12, 12, 13, 13, 13, 15, 14, 15, 15, 16, 16, 16, 18, 17, 11, 12, 12, 13, 13, 14, 14, 15, 14, 15, 16, 15, 16, 17,
				18, 19, 12, 12, 12, 13, 14, 14, 14, 14, 15, 15, 15, 16, 17, 17, 17, 18, 12, 13, 13, 14, 14, 15, 14, 15, 16, 16, 17,
				17, 17, 18, 18, 18, 13, 13, 14, 15, 15, 15, 16, 16, 16, 16, 16, 17, 18, 17, 18, 18, 14, 14, 14, 15, 15, 15, 17, 16,
				16, 19, 17, 17, 17, 19, 18, 18, 13, 14, 15, 16, 16, 16, 17, 16, 17, 17, 18, 18, 21, 20, 21, 18
			], j.t15l = [3, 5, 6, 8, 8, 9, 10, 10, 10, 11, 11, 12, 12, 12, 13, 14, 5, 5, 7, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12,
				12, 13, 13, 6, 7, 7, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 13, 13, 13, 7, 8, 8, 9, 9, 10, 10, 11, 11, 11, 12, 12,
				12, 13, 13, 13, 8, 8, 9, 9, 10, 10, 11, 11, 11, 11, 12, 12, 12, 13, 13, 13, 9, 9, 9, 10, 10, 10, 11, 11, 11, 11,
				12, 12, 13, 13, 13, 14, 10, 9, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 10, 10, 10, 11, 11, 11, 11,
				12, 12, 12, 12, 12, 13, 13, 13, 14, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 14, 14, 14, 10, 10, 11, 11,
				11, 11, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 14, 15, 14, 11,
				11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 12, 12, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 14, 14,
				15, 15, 12, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14,
				14, 15, 15, 14, 15, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15
			], j.t16_5l = [1, 5, 7, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13, 14, 11, 4, 6, 8, 9, 10, 11, 11, 11, 12, 12, 12,
				13, 14, 13, 14, 11, 7, 8, 9, 10, 11, 11, 12, 12, 13, 12, 13, 13, 13, 14, 14, 12, 9, 9, 10, 11, 11, 12, 12, 12, 13,
				13, 14, 14, 14, 15, 15, 13, 10, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 12, 10, 10, 11, 11, 12, 13,
				13, 14, 13, 14, 14, 15, 15, 15, 16, 13, 11, 11, 11, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 16, 13, 11, 11, 12,
				12, 13, 13, 13, 14, 14, 15, 15, 15, 15, 17, 17, 13, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 13,
				12, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 15, 16, 15, 14, 12, 13, 12, 13, 14, 14, 14, 14, 15, 16, 16, 16, 17,
				17, 16, 13, 13, 13, 13, 13, 14, 14, 15, 16, 16, 16, 16, 16, 16, 15, 16, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 17,
				16, 16, 16, 16, 18, 14, 15, 14, 14, 14, 15, 15, 16, 16, 16, 18, 17, 17, 17, 19, 17, 14, 14, 15, 13, 14, 16, 16, 15,
				16, 16, 17, 18, 17, 19, 17, 16, 14, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 12
			], j.t16l = [1, 5, 7, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13, 14, 10, 4, 6, 8, 9, 10, 11, 11, 11, 12, 12, 12, 13,
				14, 13, 14, 10, 7, 8, 9, 10, 11, 11, 12, 12, 13, 12, 13, 13, 13, 14, 14, 11, 9, 9, 10, 11, 11, 12, 12, 12, 13, 13,
				14, 14, 14, 15, 15, 12, 10, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 11, 10, 10, 11, 11, 12, 13, 13,
				14, 13, 14, 14, 15, 15, 15, 16, 12, 11, 11, 11, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 16, 12, 11, 11, 12, 12,
				13, 13, 13, 14, 14, 15, 15, 15, 15, 17, 17, 12, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 12, 12,
				12, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 15, 16, 15, 13, 12, 13, 12, 13, 14, 14, 14, 14, 15, 16, 16, 16, 17, 17,
				16, 12, 13, 13, 13, 13, 14, 14, 15, 16, 16, 16, 16, 16, 16, 15, 16, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 17, 16,
				16, 16, 16, 18, 13, 15, 14, 14, 14, 15, 15, 16, 16, 16, 18, 17, 17, 17, 19, 17, 13, 14, 15, 13, 14, 16, 16, 15, 16,
				16, 17, 18, 17, 19, 17, 16, 13, 10, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 10
			], j.t24l = [4, 5, 7, 8, 9, 10, 10, 11, 11, 12, 12, 12, 12, 12, 13, 10, 5, 6, 7, 8, 9, 10, 10, 11, 11, 11, 12, 12,
				12, 12, 12, 10, 7, 7, 8, 9, 9, 10, 10, 11, 11, 11, 11, 12, 12, 12, 13, 9, 8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 11,
				12, 12, 12, 12, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12, 12, 12, 13, 9, 10, 9, 10, 10, 10, 10, 11, 11, 11,
				11, 12, 12, 12, 12, 12, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 9, 11, 10, 10, 10, 11, 11,
				11, 11, 12, 12, 12, 12, 12, 13, 13, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 10, 11, 11, 11,
				11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 10, 12, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 10,
				12, 12, 11, 11, 11, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13,
				13, 13, 10, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 10, 13, 12, 12, 12, 12, 12, 12, 13, 13, 13,
				13, 13, 13, 13, 13, 10, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 6
			], j.t32l = [1, 5, 5, 7, 5, 8, 7, 9, 5, 7, 7, 9, 7, 9, 9, 10], j.t33l = [4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7,
				7, 8
			], j.ht = [new e(0, 0, null, null), new e(2, 0, j.t1HB, j.t1l), new e(3, 0, j.t2HB, j.t2l), new e(3, 0, j.t3HB, j.t3l),
				new e(0, 0, null, null), new e(4, 0, j.t5HB, j.t5l), new e(4, 0, j.t6HB, j.t6l), new e(6, 0, j.t7HB, j.t7l), new e(
					6, 0, j.t8HB, j.t8l), new e(6, 0, j.t9HB, j.t9l), new e(8, 0, j.t10HB, j.t10l), new e(8, 0, j.t11HB, j.t11l), new e(
					8, 0, j.t12HB, j.t12l), new e(16, 0, j.t13HB, j.t13l), new e(0, 0, null, j.t16_5l), new e(16, 0, j.t15HB, j.t15l),
				new e(1, 1, j.t16HB, j.t16l), new e(2, 3, j.t16HB, j.t16l), new e(3, 7, j.t16HB, j.t16l), new e(4, 15, j.t16HB, j.t16l),
				new e(6, 63, j.t16HB, j.t16l), new e(8, 255, j.t16HB, j.t16l), new e(10, 1023, j.t16HB, j.t16l), new e(13, 8191, j
					.t16HB, j.t16l), new e(4, 15, j.t24HB, j.t24l), new e(5, 31, j.t24HB, j.t24l), new e(6, 63, j.t24HB, j.t24l), new e(
					7, 127, j.t24HB, j.t24l), new e(8, 255, j.t24HB, j.t24l), new e(9, 511, j.t24HB, j.t24l), new e(11, 2047, j.t24HB,
					j.t24l), new e(13, 8191, j.t24HB, j.t24l), new e(0, 0, j.t32HB, j.t32l), new e(0, 0, j.t33HB, j.t33l)
			], j.largetbl = [65540, 327685, 458759, 589832, 655369, 655370, 720906, 720907, 786443, 786444, 786444, 851980,
				851980, 851980, 917517, 655370, 262149, 393222, 524295, 589832, 655369, 720906, 720906, 720907, 786443, 786443,
				786444, 851980, 917516, 851980, 917516, 655370, 458759, 524295, 589832, 655369, 720905, 720906, 786442, 786443,
				851979, 786443, 851979, 851980, 851980, 917516, 917517, 720905, 589832, 589832, 655369, 720905, 720906, 786442,
				786442, 786443, 851979, 851979, 917515, 917516, 917516, 983052, 983052, 786441, 655369, 655369, 720905, 720906,
				786442, 786442, 851978, 851979, 851979, 917515, 917516, 917516, 983052, 983052, 983053, 720905, 655370, 655369,
				720906, 720906, 786442, 851978, 851979, 917515, 851979, 917515, 917516, 983052, 983052, 983052, 1048588, 786441,
				720906, 720906, 720906, 786442, 851978, 851979, 851979, 851979, 917515, 917516, 917516, 917516, 983052, 983052,
				1048589, 786441, 720907, 720906, 786442, 786442, 851979, 851979, 851979, 917515, 917516, 983052, 983052, 983052,
				983052, 1114125, 1114125, 786442, 720907, 786443, 786443, 851979, 851979, 851979, 917515, 917515, 983051, 983052,
				983052, 983052, 1048588, 1048589, 1048589, 786442, 786443, 786443, 786443, 851979, 851979, 917515, 917515, 983052,
				983052, 983052, 983052, 1048588, 983053, 1048589, 983053, 851978, 786444, 851979, 786443, 851979, 917515, 917516,
				917516, 917516, 983052, 1048588, 1048588, 1048589, 1114125, 1114125, 1048589, 786442, 851980, 851980, 851979,
				851979, 917515, 917516, 983052, 1048588, 1048588, 1048588, 1048588, 1048589, 1048589, 983053, 1048589, 851978,
				851980, 917516, 917516, 917516, 917516, 983052, 983052, 983052, 983052, 1114124, 1048589, 1048589, 1048589,
				1048589, 1179661, 851978, 983052, 917516, 917516, 917516, 983052, 983052, 1048588, 1048588, 1048589, 1179661,
				1114125, 1114125, 1114125, 1245197, 1114125, 851978, 917517, 983052, 851980, 917516, 1048588, 1048588, 983052,
				1048589, 1048589, 1114125, 1179661, 1114125, 1245197, 1114125, 1048589, 851978, 655369, 655369, 655369, 720905,
				720905, 786441, 786441, 786441, 851977, 851977, 851977, 851978, 851978, 851978, 851978, 655366
			], j.table23 = [65538, 262147, 458759, 262148, 327684, 458759, 393222, 458759, 524296], j.table56 = [65539, 262148,
				458758, 524296, 262148, 327684, 524294, 589831, 458757, 524294, 589831, 655368, 524295, 524295, 589832, 655369
			], j.bitrate_table = [
				[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1],
				[0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1],
				[0, 8, 16, 24, 32, 40, 48, 56, 64, -1, -1, -1, -1, -1, -1, -1]
			], j.samplerate_table = [
				[22050, 24e3, 16e3, -1],
				[44100, 48e3, 32e3, -1],
				[11025, 12e3, 8e3, -1]
			], j.scfsi_band = [0, 6, 11, 16, 21], y.Q_MAX = 257, y.Q_MAX2 = 116, y.LARGE_BITS = 1e5, y.IXMAX_VAL = 8206;
			var z = {};

			function R() {
				var v, g, M;
				this.rv = null, this.qupvt = null;
				var R, n = new function() {
					this.setModules = function(e, t) {}
				};

				function w(e) {
					this.ordinal = e
				}

				function _(e) {
					for (var t = 0; t < e.sfbmax; t++)
						if (e.scalefac[t] + e.subblock_gain[e.window[t]] == 0) return !1;
					return !0
				}

				function B(e, t, a, s, n) {
					var r;
					switch (e) {
						default:
						case 9:
							0 < t.over_count ? (r = a.over_SSD <= t.over_SSD, a.over_SSD == t.over_SSD && (r = a.bits < t.bits)) : r = a.max_noise <
								0 && 10 * a.max_noise + a.bits <= 10 * t.max_noise + t.bits;
							break;
						case 0:
							r = a.over_count < t.over_count || a.over_count == t.over_count && a.over_noise < t.over_noise || a.over_count ==
								t.over_count && q.EQ(a.over_noise, t.over_noise) && a.tot_noise < t.tot_noise;
							break;
						case 8:
							a.max_noise = function(e, t) {
								for (var a, s = 1e-37, n = 0; n < t.psymax; n++) s += (a = e[n], ee.FAST_LOG10(.368 + .632 * a * a * a));
								return Math.max(1e-20, s)
							}(n, s);
						case 1:
							r = a.max_noise < t.max_noise;
							break;
						case 2:
							r = a.tot_noise < t.tot_noise;
							break;
						case 3:
							r = a.tot_noise < t.tot_noise && a.max_noise < t.max_noise;
							break;
						case 4:
							r = a.max_noise <= 0 && .2 < t.max_noise || a.max_noise <= 0 && t.max_noise < 0 && t.max_noise > a.max_noise -
								.2 && a.tot_noise < t.tot_noise || a.max_noise <= 0 && 0 < t.max_noise && t.max_noise > a.max_noise - .2 && a.tot_noise <
								t.tot_noise + t.over_noise || 0 < a.max_noise && -.05 < t.max_noise && t.max_noise > a.max_noise - .1 && a.tot_noise +
								a.over_noise < t.tot_noise + t.over_noise || 0 < a.max_noise && -.1 < t.max_noise && t.max_noise > a.max_noise -
								.15 && a.tot_noise + a.over_noise + a.over_noise < t.tot_noise + t.over_noise + t.over_noise;
							break;
						case 5:
							r = a.over_noise < t.over_noise || q.EQ(a.over_noise, t.over_noise) && a.tot_noise < t.tot_noise;
							break;
						case 6:
							r = a.over_noise < t.over_noise || q.EQ(a.over_noise, t.over_noise) && (a.max_noise < t.max_noise || q.EQ(a.max_noise,
								t.max_noise) && a.tot_noise <= t.tot_noise);
							break;
						case 7:
							r = a.over_count < t.over_count || a.over_noise < t.over_noise
					}
					return 0 == t.over_count && (r = r && a.bits < t.bits), r
				}

				function A(e, t, a, s, n) {
					var r = e.internal_flags;
					! function(e, t, a, s, n) {
						var r, i = e.internal_flags;
						r = 0 == t.scalefac_scale ? 1.2968395546510096 : 1.6817928305074292;
						for (var _ = 0, o = 0; o < t.sfbmax; o++) _ < a[o] && (_ = a[o]);
						var l = i.noise_shaping_amp;
						switch (3 == l && (l = n ? 2 : 1), l) {
							case 2:
								break;
							case 1:
								1 < _ ? _ = Math.pow(_, .5) : _ *= .95;
								break;
							case 0:
							default:
								1 < _ ? _ = 1 : _ *= .95
						}
						var f = 0;
						for (o = 0; o < t.sfbmax; o++) {
							var c, h = t.width[o];
							if (f += h, !(a[o] < _)) {
								if (0 != (2 & i.substep_shaping) && (i.pseudohalf[o] = 0 == i.pseudohalf[o] ? 1 : 0, 0 == i.pseudohalf[o] && 2 ==
										i.noise_shaping_amp)) return;
								for (t.scalefac[o]++, c = -h; c < 0; c++) s[f + c] *= r, s[f + c] > t.xrpow_max && (t.xrpow_max = s[f + c]);
								if (2 == i.noise_shaping_amp) return
							}
						}
					}(e, t, a, s, n);
					var i = _(t);
					return !i && (!(i = 2 == r.mode_gr ? R.scale_bitcount(t) : R.scale_bitcount_lsf(r, t)) || (1 < r.noise_shaping &&
						(xe.fill(r.pseudohalf, 0), 0 == t.scalefac_scale ? (! function(e, t) {
							for (var a = 0, s = 0; s < e.sfbmax; s++) {
								var n = e.width[s],
									r = e.scalefac[s];
								if (0 != e.preflag && (r += M.pretab[s]), a += n, 0 != (1 & r)) {
									r++;
									for (var i = -n; i < 0; i++) t[a + i] *= 1.2968395546510096, t[a + i] > e.xrpow_max && (e.xrpow_max = t[a +
										i])
								}
								e.scalefac[s] = r >> 1
							}
							e.preflag = 0, e.scalefac_scale = 1
						}(t, s), i = !1) : t.block_type == Pe.SHORT_TYPE && 0 < r.subblock_gain && (i = function(e, t, a) {
							var s, n = t.scalefac;
							for (s = 0; s < t.sfb_lmax; s++)
								if (16 <= n[s]) return !0;
							for (var r = 0; r < 3; r++) {
								var i = 0,
									_ = 0;
								for (s = t.sfb_lmax + r; s < t.sfbdivide; s += 3) i < n[s] && (i = n[s]);
								for (; s < t.sfbmax; s += 3) _ < n[s] && (_ = n[s]);
								if (!(i < 16 && _ < 8)) {
									if (7 <= t.subblock_gain[r]) return !0;
									t.subblock_gain[r]++;
									var o = e.scalefac_band.l[t.sfb_lmax];
									for (s = t.sfb_lmax + r; s < t.sfbmax; s += 3) {
										var l = t.width[s],
											f = n[s];
										if (0 <= (f -= 4 >> t.scalefac_scale)) n[s] = f, o += 3 * l;
										else {
											n[s] = 0;
											var c = 210 + (f << t.scalefac_scale + 1);
											u = M.IPOW20(c), o += l * (r + 1);
											for (var h = -l; h < 0; h++) a[o + h] *= u, a[o + h] > t.xrpow_max && (t.xrpow_max = a[o + h]);
											o += l * (3 - r - 1)
										}
									}
									var u = M.IPOW20(202);
									for (o += t.width[s] * (r + 1), h = -t.width[s]; h < 0; h++) a[o + h] *= u, a[o + h] > t.xrpow_max && (t.xrpow_max =
										a[o + h])
								}
							}
							return !1
						}(r, t, s) || _(t))), i || (i = 2 == r.mode_gr ? R.scale_bitcount(t) : R.scale_bitcount_lsf(r, t)), !i))
				}
				this.setModules = function(e, t, a, s) {
						v = e, g = t, this.rv = t, M = a, this.qupvt = a, R = s, n.setModules(M, R)
					}, this.ms_convert = function(e, t) {
						for (var a = 0; a < 576; ++a) {
							var s = e.tt[t][0].xr[a],
								n = e.tt[t][1].xr[a];
							e.tt[t][0].xr[a] = (s + n) * (.5 * ee.SQRT2), e.tt[t][1].xr[a] = (s - n) * (.5 * ee.SQRT2)
						}
					}, this.init_xrpow = function(e, t, a) {
						var s = 0,
							n = 0 | t.max_nonzero_coeff;
						if (t.xrpow_max = 0, xe.fill(a, n, 576, 0), 1e-20 < (s = function(e, t, a, s) {
								for (var n = s = 0; n <= a; ++n) {
									var r = Math.abs(e.xr[n]);
									s += r, t[n] = Math.sqrt(r * Math.sqrt(r)), t[n] > e.xrpow_max && (e.xrpow_max = t[n])
								}
								return s
							}(t, a, n, s))) {
							var r = 0;
							0 != (2 & e.substep_shaping) && (r = 1);
							for (var i = 0; i < t.psymax; i++) e.pseudohalf[i] = r;
							return !0
						}
						return xe.fill(t.l3_enc, 0, 576, 0), !1
					}, this.init_outer_loop = function(e, t) {
						t.part2_3_length = 0, t.big_values = 0, t.count1 = 0, t.global_gain = 210, t.scalefac_compress = 0, t.table_select[
								0] = 0, t.table_select[1] = 0, t.table_select[2] = 0, t.subblock_gain[0] = 0, t.subblock_gain[1] = 0, t.subblock_gain[
								2] = 0, t.subblock_gain[3] = 0, t.region0_count = 0, t.region1_count = 0, t.preflag = 0, t.scalefac_scale = 0,
							t.count1table_select = 0, t.part2_length = 0, t.sfb_lmax = Pe.SBPSY_l, t.sfb_smin = Pe.SBPSY_s, t.psy_lmax = e.sfb21_extra ?
							Pe.SBMAX_l : Pe.SBPSY_l, t.psymax = t.psy_lmax, t.sfbmax = t.sfb_lmax, t.sfbdivide = 11;
						for (var a = 0; a < Pe.SBMAX_l; a++) t.width[a] = e.scalefac_band.l[a + 1] - e.scalefac_band.l[a], t.window[a] =
							3;
						if (t.block_type == Pe.SHORT_TYPE) {
							var s = Ae(576);
							t.sfb_smin = 0, (t.sfb_lmax = 0) != t.mixed_block_flag && (t.sfb_smin = 3, t.sfb_lmax = 2 * e.mode_gr + 4), t.psymax =
								t.sfb_lmax + 3 * ((e.sfb21_extra ? Pe.SBMAX_s : Pe.SBPSY_s) - t.sfb_smin), t.sfbmax = t.sfb_lmax + 3 * (Pe.SBPSY_s -
									t.sfb_smin), t.sfbdivide = t.sfbmax - 18, t.psy_lmax = t.sfb_lmax;
							var n = e.scalefac_band.l[t.sfb_lmax];
							$.arraycopy(t.xr, 0, s, 0, 576);
							for (a = t.sfb_smin; a < Pe.SBMAX_s; a++)
								for (var r = e.scalefac_band.s[a], i = e.scalefac_band.s[a + 1], _ = 0; _ < 3; _++)
									for (var o = r; o < i; o++) t.xr[n++] = s[3 * o + _];
							var l = t.sfb_lmax;
							for (a = t.sfb_smin; a < Pe.SBMAX_s; a++) t.width[l] = t.width[l + 1] = t.width[l + 2] = e.scalefac_band.s[a + 1] -
								e.scalefac_band.s[a], t.window[l] = 0, t.window[l + 1] = 1, t.window[l + 2] = 2, l += 3
						}
						t.count1bits = 0, t.sfb_partition_table = M.nr_of_sfb_block[0][0], t.slen[0] = 0, t.slen[1] = 0, t.slen[2] = 0, t
							.slen[3] = 0, t.max_nonzero_coeff = 575, xe.fill(t.scalefac, 0),
							function(e, t) {
								var a = e.ATH,
									s = t.xr;
								if (t.block_type != Pe.SHORT_TYPE)
									for (var n = !1, r = Pe.PSFB21 - 1; 0 <= r && !n; r--) {
										var i = e.scalefac_band.psfb21[r],
											_ = e.scalefac_band.psfb21[r + 1],
											o = M.athAdjust(a.adjust, a.psfb21[r], a.floor);
										1e-12 < e.nsPsy.longfact[21] && (o *= e.nsPsy.longfact[21]);
										for (var l = _ - 1; i <= l; l--) {
											if (!(Math.abs(s[l]) < o)) {
												n = !0;
												break
											}
											s[l] = 0
										}
									} else
										for (var f = 0; f < 3; f++)
											for (n = !1, r = Pe.PSFB12 - 1; 0 <= r && !n; r--) {
												_ = (i = 3 * e.scalefac_band.s[12] + (e.scalefac_band.s[13] - e.scalefac_band.s[12]) * f + (e.scalefac_band
													.psfb12[r] - e.scalefac_band.psfb12[0])) + (e.scalefac_band.psfb12[r + 1] - e.scalefac_band.psfb12[r]);
												var c = M.athAdjust(a.adjust, a.psfb12[r], a.floor);
												for (1e-12 < e.nsPsy.shortfact[12] && (c *= e.nsPsy.shortfact[12]), l = _ - 1; i <= l; l--) {
													if (!(Math.abs(s[l]) < c)) {
														n = !0;
														break
													}
													s[l] = 0
												}
											}
							}(e, t)
					}, w.BINSEARCH_NONE = new w(0), w.BINSEARCH_UP = new w(1), w.BINSEARCH_DOWN = new w(2), this.trancate_smallspectrums =
					function(e, t, a, s) {
						var n = Ae(z.SFBMAX);
						if ((0 != (4 & e.substep_shaping) || t.block_type != Pe.SHORT_TYPE) && 0 == (128 & e.substep_shaping)) {
							M.calc_noise(t, a, n, new x, null);
							for (var r = 0; r < 576; r++) {
								var i = 0;
								0 != t.l3_enc[r] && (i = Math.abs(t.xr[r])), s[r] = i
							}
							r = 0;
							var _ = 8;
							t.block_type == Pe.SHORT_TYPE && (_ = 6);
							do {
								var o, l, f, c, h = t.width[_];
								if (r += h, !(1 <= n[_] || (xe.sort(s, r - h, h), q.EQ(s[r - 1], 0)))) {
									o = (1 - n[_]) * a[_], c = l = 0;
									do {
										var u;
										for (f = 1; c + f < h && !q.NEQ(s[c + r - h], s[c + r + f - h]); f++);
										if (o < (u = s[c + r - h] * s[c + r - h] * f)) {
											0 != c && (l = s[c + r - h - 1]);
											break
										}
										o -= u, c += f
									} while (c < h);
									if (!q.EQ(l, 0))
										for (; Math.abs(t.xr[r - h]) <= l && (t.l3_enc[r - h] = 0), 0 < --h;);
								}
							} while (++_ < t.psymax);
							t.part2_3_length = R.noquant_count_bits(e, t, null)
						}
					}, this.outer_loop = function(e, t, a, s, n, r) {
						var i = e.internal_flags,
							_ = new k,
							o = Ae(576),
							l = Ae(z.SFBMAX),
							f = new x,
							c = new function() {
								this.global_gain = 0, this.sfb_count1 = 0, this.step = Be(39), this.noise = Ae(39), this.noise_log = Ae(39)
							},
							h = 9999999,
							u = !1,
							m = !1,
							b = 0;
						if (function(e, t, a, s, n) {
								var r, i = e.CurrentStep[s],
									_ = !1,
									o = e.OldValue[s],
									l = w.BINSEARCH_NONE;
								for (t.global_gain = o, a -= t.part2_length;;) {
									var f;
									if (r = R.count_bits(e, n, t, null), 1 == i || r == a) break;
									a < r ? (l == w.BINSEARCH_DOWN && (_ = !0), _ && (i /= 2), l = w.BINSEARCH_UP, f = i) : (l == w.BINSEARCH_UP &&
										(_ = !0), _ && (i /= 2), l = w.BINSEARCH_DOWN, f = -i), t.global_gain += f, t.global_gain < 0 && (_ = !(t.global_gain =
										0)), 255 < t.global_gain && (t.global_gain = 255, _ = !0)
								}
								for (; a < r && t.global_gain < 255;) t.global_gain++, r = R.count_bits(e, n, t, null);
								e.CurrentStep[s] = 4 <= o - t.global_gain ? 4 : 2, e.OldValue[s] = t.global_gain, t.part2_3_length = r
							}(i, t, r, n, s), 0 == i.noise_shaping) return 100;
						M.calc_noise(t, a, l, f, c), f.bits = t.part2_3_length, _.assign(t);
						var p = 0;
						for ($.arraycopy(s, 0, o, 0, 576); !u;) {
							do {
								var v, d = new x,
									g = 255;
								if (v = 0 != (2 & i.substep_shaping) ? 20 : 3, i.sfb21_extra) {
									if (1 < l[_.sfbmax]) break;
									if (_.block_type == Pe.SHORT_TYPE && (1 < l[_.sfbmax + 1] || 1 < l[_.sfbmax + 2])) break
								}
								if (!A(e, _, l, s, m)) break;
								0 != _.scalefac_scale && (g = 254);
								var S = r - _.part2_length;
								if (S <= 0) break;
								for (;
									(_.part2_3_length = R.count_bits(i, s, _, c)) > S && _.global_gain <= g;) _.global_gain++;
								if (_.global_gain > g) break;
								if (0 == f.over_count) {
									for (;
										(_.part2_3_length = R.count_bits(i, s, _, c)) > h && _.global_gain <= g;) _.global_gain++;
									if (_.global_gain > g) break
								}
								if (M.calc_noise(_, a, l, d, c), d.bits = _.part2_3_length, 0 != (B(t.block_type != Pe.SHORT_TYPE ? e.quant_comp :
										e.quant_comp_short, f, d, _, l) ? 1 : 0)) h = t.part2_3_length, f = d, t.assign(_), p = 0, $.arraycopy(s, 0,
									o, 0, 576);
								else if (0 == i.full_outer_loop) {
									if (++p > v && 0 == f.over_count) break;
									if (3 == i.noise_shaping_amp && m && 30 < p) break;
									if (3 == i.noise_shaping_amp && m && 15 < _.global_gain - b) break
								}
							} while (_.global_gain + _.scalefac_scale < 255);
							3 == i.noise_shaping_amp ? m ? u = !0 : (_.assign(t), $.arraycopy(o, 0, s, 0, 576), p = 0, b = _.global_gain, m = !
								0) : u = !0
						}
						return e.VBR == ye.vbr_rh || e.VBR == ye.vbr_mtrh ? $.arraycopy(o, 0, s, 0, 576) : 0 != (1 & i.substep_shaping) &&
							trancate_smallspectrums(i, t, a, s), f.over_count
					}, this.iteration_finish_one = function(e, t, a) {
						var s = e.l3_side,
							n = s.tt[t][a];
						R.best_scalefac_store(e, t, a, s), 1 == e.use_best_huffman && R.best_huffman_divide(e, n), g.ResvAdjust(e, n)
					}, this.VBR_encode_granule = function(e, t, a, s, n, r, i) {
						var _, o = e.internal_flags,
							l = new k,
							f = Ae(576),
							c = i,
							h = i + 1,
							u = (i + r) / 2,
							m = 0,
							b = o.sfb21_extra;
						for (xe.fill(l.l3_enc, 0); o.sfb21_extra = !(c - 42 < u) && b, outer_loop(e, t, a, s, n, u) <= 0 ? (m = 1, h = t.part2_3_length,
								l.assign(t), $.arraycopy(s, 0, f, 0, 576), _ = (i = h - 32) - r, u = (i + r) / 2) : (_ = i - (r = u + 32), u =
								(i + r) / 2, 0 != m && (m = 2, t.assign(l), $.arraycopy(f, 0, s, 0, 576))), 12 < _;);
						o.sfb21_extra = b, 2 == m && $.arraycopy(l.l3_enc, 0, t.l3_enc, 0, 576)
					}, this.get_framebits = function(e, t) {
						var a = e.internal_flags;
						a.bitrate_index = a.VBR_min_bitrate;
						var s = v.getframebits(e);
						a.bitrate_index = 1, s = v.getframebits(e);
						for (var n = 1; n <= a.VBR_max_bitrate; n++) {
							a.bitrate_index = n;
							var r = new F(s);
							t[n] = g.ResvFrameBegin(e, r), s = r.bits
						}
					}, this.VBR_old_prepare = function(e, t, a, s, n, r, i, _, o) {
						var l, f = e.internal_flags,
							c = 0,
							h = 1,
							u = 0;
						f.bitrate_index = f.VBR_max_bitrate;
						var m = g.ResvFrameBegin(e, new F(0)) / f.mode_gr;
						get_framebits(e, r);
						for (var b = 0; b < f.mode_gr; b++) {
							var p = M.on_pe(e, t, _[b], m, b, 0);
							f.mode_ext == Pe.MPG_MD_MS_LR && (ms_convert(f.l3_side, b), M.reduce_side(_[b], a[b], m, p));
							for (var v = 0; v < f.channels_out; ++v) {
								var d = f.l3_side.tt[b][v];
								d.block_type != Pe.SHORT_TYPE ? (c = 1.28 / (1 + Math.exp(3.5 - t[b][v] / 300)) - .05, l = f.PSY.mask_adjust -
										c) : (c = 2.56 / (1 + Math.exp(3.5 - t[b][v] / 300)) - .14, l = f.PSY.mask_adjust_short - c), f.masking_lower =
									Math.pow(10, .1 * l), init_outer_loop(f, d), o[b][v] = M.calc_xmin(e, s[b][v], d, n[b][v]), 0 != o[b][v] && (h =
										0), i[b][v] = 126, u += _[b][v]
							}
						}
						for (b = 0; b < f.mode_gr; b++)
							for (v = 0; v < f.channels_out; v++) u > r[f.VBR_max_bitrate] && (_[b][v] *= r[f.VBR_max_bitrate], _[b][v] /= u),
								i[b][v] > _[b][v] && (i[b][v] = _[b][v]);
						return h
					}, this.bitpressure_strategy = function(e, t, a, s) {
						for (var n = 0; n < e.mode_gr; n++)
							for (var r = 0; r < e.channels_out; r++) {
								for (var i = e.l3_side.tt[n][r], _ = t[n][r], o = 0, l = 0; l < i.psy_lmax; l++) _[o++] *= 1 + .029 * l * l /
									Pe.SBMAX_l / Pe.SBMAX_l;
								if (i.block_type == Pe.SHORT_TYPE)
									for (l = i.sfb_smin; l < Pe.SBMAX_s; l++) _[o++] *= 1 + .029 * l * l / Pe.SBMAX_s / Pe.SBMAX_s, _[o++] *= 1 +
										.029 * l * l / Pe.SBMAX_s / Pe.SBMAX_s, _[o++] *= 1 + .029 * l * l / Pe.SBMAX_s / Pe.SBMAX_s;
								s[n][r] = 0 | Math.max(a[n][r], .9 * s[n][r])
							}
					}, this.VBR_new_prepare = function(e, t, a, s, n, r) {
						var i, _ = e.internal_flags,
							o = 1,
							l = 0,
							f = 0;
						if (e.free_format) {
							_.bitrate_index = 0;
							c = new F(l);
							i = g.ResvFrameBegin(e, c), l = c.bits, n[0] = i
						} else {
							_.bitrate_index = _.VBR_max_bitrate;
							var c = new F(l);
							g.ResvFrameBegin(e, c), l = c.bits, get_framebits(e, n), i = n[_.VBR_max_bitrate]
						}
						for (var h = 0; h < _.mode_gr; h++) {
							M.on_pe(e, t, r[h], l, h, 0), _.mode_ext == Pe.MPG_MD_MS_LR && ms_convert(_.l3_side, h);
							for (var u = 0; u < _.channels_out; ++u) {
								var m = _.l3_side.tt[h][u];
								_.masking_lower = Math.pow(10, .1 * _.PSY.mask_adjust), init_outer_loop(_, m), 0 != M.calc_xmin(e, a[h][u], m,
									s[h][u]) && (o = 0), f += r[h][u]
							}
						}
						for (h = 0; h < _.mode_gr; h++)
							for (u = 0; u < _.channels_out; u++) i < f && (r[h][u] *= i, r[h][u] /= f);
						return o
					}, this.calc_target_bits = function(e, t, a, s, n, r) {
						var i, _, o, l, f = e.internal_flags,
							c = f.l3_side,
							h = 0;
						f.bitrate_index = f.VBR_max_bitrate;
						var u = new F(h);
						for (r[0] = g.ResvFrameBegin(e, u), h = u.bits, f.bitrate_index = 1, h = v.getframebits(e) - 8 * f.sideinfo_len,
							n[0] = h / (f.mode_gr * f.channels_out), h = e.VBR_mean_bitrate_kbps * e.framesize * 1e3, 0 != (1 & f.substep_shaping) &&
							(h *= 1.09), h /= e.out_samplerate, h -= 8 * f.sideinfo_len, h /= f.mode_gr * f.channels_out, (i = .93 + .07 * (
								11 - e.compression_ratio) / 5.5) < .9 && (i = .9), 1 < i && (i = 1), _ = 0; _ < f.mode_gr; _++) {
							var m = 0;
							for (o = 0; o < f.channels_out; o++) {
								if (s[_][o] = int(i * h), 700 < t[_][o]) {
									var b = int((t[_][o] - 700) / 1.4),
										p = c.tt[_][o];
									s[_][o] = int(i * h), p.block_type == Pe.SHORT_TYPE && b < h / 2 && (b = h / 2), 3 * h / 2 < b ? b = 3 * h / 2 :
										b < 0 && (b = 0), s[_][o] += b
								}
								s[_][o] > Z.MAX_BITS_PER_CHANNEL && (s[_][o] = Z.MAX_BITS_PER_CHANNEL), m += s[_][o]
							}
							if (Z.MAX_BITS_PER_GRANULE < m)
								for (o = 0; o < f.channels_out; ++o) s[_][o] *= Z.MAX_BITS_PER_GRANULE, s[_][o] /= m
						}
						if (f.mode_ext == Pe.MPG_MD_MS_LR)
							for (_ = 0; _ < f.mode_gr; _++) M.reduce_side(s[_], a[_], h * f.channels_out, Z.MAX_BITS_PER_GRANULE);
						for (_ = l = 0; _ < f.mode_gr; _++)
							for (o = 0; o < f.channels_out; o++) s[_][o] > Z.MAX_BITS_PER_CHANNEL && (s[_][o] = Z.MAX_BITS_PER_CHANNEL), l +=
								s[_][o];
						if (l > r[0])
							for (_ = 0; _ < f.mode_gr; _++)
								for (o = 0; o < f.channels_out; o++) s[_][o] *= r[0], s[_][o] /= l
					}
			}

			function D() {
				this.thm = new i, this.en = new i
			}

			function Pe() {
				var E = Pe.FFTOFFSET,
					P = Pe.MPG_MD_MS_LR,
					H = null,
					I = this.psy = null,
					L = null,
					V = null;
				this.setModules = function(e, t, a, s) {
					H = e, this.psy = t, I = t, L = s, V = a
				};
				var O = new function() {
					var h = [-.1482523854003001, 32.308141959636465, 296.40344946382766, 883.1344870032432, 11113.947376231741,
							1057.2713659324597, 305.7402417275812, 30.825928907280012, 3.8533188138216365, 59.42900443849514,
							709.5899960123345, 5281.91112291017, -5829.66483675846, -817.6293103748613, -76.91656988279972, -
							4.594269939176596, .9063471690191471, .1960342806591213, -.15466694054279598, 34.324387823855965,
							301.8067566458425, 817.599602898885, 11573.795901679885, 1181.2520595540152, 321.59731579894424,
							31.232021761053772, 3.7107095756221318, 53.650946155329365, 684.167428119626, 5224.56624370173, -
							6366.391851890084, -908.9766368219582, -89.83068876699639, -5.411397422890401, .8206787908286602,
							.3901806440322567, -.16070888947830023, 36.147034243915876, 304.11815768187864, 732.7429163887613,
							11989.60988270091, 1300.012278487897, 335.28490093152146, 31.48816102859945, 3.373875931311736,
							47.232241542899175, 652.7371796173471, 5132.414255594984, -6909.087078780055, -1001.9990371107289, -
							103.62185754286375, -6.104916304710272, .7416505462720353, .5805693545089249, -.16636367662261495,
							37.751650073343995, 303.01103387567713, 627.9747488785183, 12358.763425278165, 1412.2779918482834,
							346.7496836825721, 31.598286663170416, 3.1598635433980946, 40.57878626349686, 616.1671130880391,
							5007.833007176154, -7454.040671756168, -1095.7960341867115, -118.24411666465777, -6.818469345853504,
							.6681786379192989, .7653668647301797, -.1716176790982088, 39.11551877123304, 298.3413246578966,
							503.5259106886539, 12679.589408408976, 1516.5821921214542, 355.9850766329023, 31.395241710249053,
							2.9164211881972335, 33.79716964664243, 574.8943997801362, 4853.234992253242, -7997.57021486075, -
							1189.7624067269965, -133.6444792601766, -7.7202770609839915, .5993769336819237, .9427934736519954, -
							.17645823955292173, 40.21879108166477, 289.9982036694474, 359.3226160751053, 12950.259102786438,
							1612.1013903507662, 362.85067106591504, 31.045922092242872, 2.822222032597987, 26.988862316190684,
							529.8996541764288, 4671.371946949588, -8535.899136645805, -1282.5898586244496, -149.58553632943463, -
							8.643494270763135, .5345111359507916, 1.111140466039205, -.36174739330527045, 41.04429910497807,
							277.5463268268618, 195.6386023135583, 13169.43812144731, 1697.6433561479398, 367.40983966190305,
							30.557037410382826, 2.531473372857427, 20.070154905927314, 481.50208566532336, 4464.970341588308, -
							9065.36882077239, -1373.62841526722, -166.1660487028118, -9.58289321133207, .4729647758913199,
							1.268786568327291, -.36970682634889585, 41.393213350082036, 261.2935935556502, 12.935476055240873,
							13336.131683328815, 1772.508612059496, 369.76534388639965, 29.751323653701338, 2.4023193045459172,
							13.304795348228817, 430.5615775526625, 4237.0568611071185, -9581.931701634761, -1461.6913552409758, -
							183.12733958476446, -10.718010163869403, .41421356237309503, 1.414213562373095, -.37677560326535325,
							41.619486213528496, 241.05423794991074, -187.94665032361226, 13450.063605744153, 1836.153896465782,
							369.4908799925761, 29.001847876923147, 2.0714759319987186, 6.779591200894186, 377.7767837205709,
							3990.386575512536, -10081.709459700915, -1545.947424837898, -200.3762958015653, -11.864482073055006,
							.3578057213145241, 1.546020906725474, -.3829366947518991, 41.1516456456653, 216.47684307105183, -
							406.1569483347166, 13511.136535077321, 1887.8076599260432, 367.3025214564151, 28.136213436723654,
							1.913880671464418, .3829366947518991, 323.85365704338597, 3728.1472257487526, -10561.233882199509, -
							1625.2025997821418, -217.62525175416, -13.015432208941645, .3033466836073424, 1.66293922460509, -
							.5822628872992417, 40.35639251440489, 188.20071124269245, -640.2706748618148, 13519.21490106562,
							1927.6022433578062, 362.8197642637487, 26.968821921868447, 1.7463817695935329, -5.62650678237171,
							269.3016715297017, 3453.386536448852, -11016.145278780888, -1698.6569643425091, -234.7658734267683, -
							14.16351421663124, .2504869601913055, 1.76384252869671, -.5887180101749253, 39.23429103868072,
							155.76096234403798, -889.2492977967378, 13475.470561874661, 1955.0535223723712, 356.4450994756727,
							25.894952980042156, 1.5695032905781554, -11.181939564328772, 214.80884394039484, 3169.1640829158237, -
							11443.321309975563, -1765.1588461316153, -251.68908574481912, -15.49755935939164, .198912367379658,
							1.847759065022573, -.7912582233652842, 37.39369355329111, 119.699486012458, -1151.0956593239027,
							13380.446257078214, 1970.3952110853447, 348.01959814116185, 24.731487364283044, 1.3850130831637748, -
							16.421408865300393, 161.05030052864092, 2878.3322807850063, -11838.991423510031, -1823.985884688674, -
							268.2854986386903, -16.81724543849939, .1483359875383474, 1.913880671464418, -.7960642926861912,
							35.2322109610459, 80.01928065061526, -1424.0212633405113, 13235.794061869668, 1973.804052543835,
							337.9908651258184, 23.289159354463873, 1.3934255946442087, -21.099669467133474, 108.48348407242611,
							2583.700758091299, -12199.726194855148, -1874.2780658979746, -284.2467154529415, -18.11369784385905,
							.09849140335716425, 1.961570560806461, -.998795456205172, 32.56307803611191, 36.958364584370486, -
							1706.075448829146, 13043.287458812016, 1965.3831106103316, 326.43182772364605, 22.175018750622293,
							1.198638339011324, -25.371248002043963, 57.53505923036915, 2288.41886619975, -12522.674544337233, -
							1914.8400385312243, -299.26241273417224, -19.37805630698734, .04912684976946725, 1.990369453344394, .035780907 *
							ee.SQRT2 * .5 / 2384e-9, .017876148 * ee.SQRT2 * .5 / 2384e-9, .003134727 * ee.SQRT2 * .5 / 2384e-9, .002457142 *
							ee.SQRT2 * .5 / 2384e-9, 971317e-9 * ee.SQRT2 * .5 / 2384e-9, 218868e-9 * ee.SQRT2 * .5 / 2384e-9, 101566e-9 *
							ee.SQRT2 * .5 / 2384e-9, 13828e-9 * ee.SQRT2 * .5 / 2384e-9, 12804.797818791945, 1945.5515939597317,
							313.4244966442953, 49591e-9 / 2384e-9, 1995.1556208053692, 21458e-9 / 2384e-9, -69618e-9 / 2384e-9
						],
						z = [
							[2.382191739347913e-13, 6.423305872147834e-13, 9.400849094049688e-13, 1.122435026096556e-12,
								1.183840321267481e-12, 1.122435026096556e-12, 9.40084909404969e-13, 6.423305872147839e-13,
								2.382191739347918e-13, 5.456116108943412e-12, 4.878985199565852e-12, 4.240448995017367e-12,
								3.559909094758252e-12, 2.858043359288075e-12, 2.156177623817898e-12, 1.475637723558783e-12,
								8.371015190102974e-13, 2.599706096327376e-13, -5.456116108943412e-12, -4.878985199565852e-12, -
								4.240448995017367e-12, -3.559909094758252e-12, -2.858043359288076e-12, -2.156177623817898e-12, -
								1.475637723558783e-12, -8.371015190102975e-13, -2.599706096327376e-13, -2.382191739347923e-13, -
								6.423305872147843e-13, -9.400849094049696e-13, -1.122435026096556e-12, -1.183840321267481e-12, -
								1.122435026096556e-12, -9.400849094049694e-13, -6.42330587214784e-13, -2.382191739347918e-13
							],
							[2.382191739347913e-13, 6.423305872147834e-13, 9.400849094049688e-13, 1.122435026096556e-12,
								1.183840321267481e-12, 1.122435026096556e-12, 9.400849094049688e-13, 6.423305872147841e-13,
								2.382191739347918e-13, 5.456116108943413e-12, 4.878985199565852e-12, 4.240448995017367e-12,
								3.559909094758253e-12, 2.858043359288075e-12, 2.156177623817898e-12, 1.475637723558782e-12,
								8.371015190102975e-13, 2.599706096327376e-13, -5.461314069809755e-12, -4.921085770524055e-12, -
								4.343405037091838e-12, -3.732668368707687e-12, -3.093523840190885e-12, -2.430835727329465e-12, -
								1.734679010007751e-12, -9.74825365660928e-13, -2.797435120168326e-13, 0, 0, 0, 0, 0, 0, -2.283748241799531e-13,
								-4.037858874020686e-13, -2.146547464825323e-13
							],
							[.1316524975873958, .414213562373095, .7673269879789602, 1.091308501069271, 1.303225372841206, 1.56968557711749,
								1.920982126971166, 2.414213562373094, 3.171594802363212, 4.510708503662055, 7.595754112725146,
								22.90376554843115, .984807753012208, .6427876096865394, .3420201433256688, .9396926207859084, -
								.1736481776669303, -.7660444431189779, .8660254037844387, .5, -.5144957554275265, -.4717319685649723, -
								.3133774542039019, -.1819131996109812, -.09457419252642064, -.04096558288530405, -.01419856857247115, -
								.003699974673760037, .8574929257125442, .8817419973177052, .9496286491027329, .9833145924917901,
								.9955178160675857, .9991605581781475, .999899195244447, .9999931550702802
							],
							[0, 0, 0, 0, 0, 0, 2.283748241799531e-13, 4.037858874020686e-13, 2.146547464825323e-13, 5.461314069809755e-12,
								4.921085770524055e-12, 4.343405037091838e-12, 3.732668368707687e-12, 3.093523840190885e-12,
								2.430835727329466e-12, 1.734679010007751e-12, 9.74825365660928e-13, 2.797435120168326e-13, -
								5.456116108943413e-12, -4.878985199565852e-12, -4.240448995017367e-12, -3.559909094758253e-12, -
								2.858043359288075e-12, -2.156177623817898e-12, -1.475637723558782e-12, -8.371015190102975e-13, -
								2.599706096327376e-13, -2.382191739347913e-13, -6.423305872147834e-13, -9.400849094049688e-13, -
								1.122435026096556e-12, -1.183840321267481e-12, -1.122435026096556e-12, -9.400849094049688e-13, -
								6.423305872147841e-13, -2.382191739347918e-13
							]
						],
						Z = z[Pe.SHORT_TYPE],
						K = z[Pe.SHORT_TYPE],
						G = z[Pe.SHORT_TYPE],
						U = z[Pe.SHORT_TYPE],
						Q = [0, 1, 16, 17, 8, 9, 24, 25, 4, 5, 20, 21, 12, 13, 28, 29, 2, 3, 18, 19, 10, 11, 26, 27, 6, 7, 22, 23, 14,
							15, 30, 31
						];

					function W(e, t, a) {
						for (var s, n, r, i = 10, _ = t + 238 - 14 - 286, o = -15; o < 0; o++) {
							var l, f, c;
							l = h[i + -10], f = e[_ + -224] * l, c = e[t + 224] * l, l = h[i + -9], f += e[_ + -160] * l, c += e[t + 160] *
								l, l = h[i + -8], f += e[_ + -96] * l, c += e[t + 96] * l, l = h[i + -7], f += e[_ + -32] * l, c += e[t + 32] *
								l, l = h[i + -6], f += e[_ + 32] * l, c += e[t + -32] * l, l = h[i + -5], f += e[_ + 96] * l, c += e[t + -96] *
								l, l = h[i + -4], f += e[_ + 160] * l, c += e[t + -160] * l, l = h[i + -3], f += e[_ + 224] * l, c += e[t + -
									224] * l, l = h[i + -2], f += e[t + -256] * l, c -= e[_ + 256] * l, l = h[i + -1], f += e[t + -192] * l, c -=
								e[_ + 192] * l, l = h[i + 0], f += e[t + -128] * l, c -= e[_ + 128] * l, l = h[i + 1], f += e[t + -64] * l, c -=
								e[_ + 64] * l, l = h[i + 2], f += e[t + 0] * l, c -= e[_ + 0] * l, l = h[i + 3], f += e[t + 64] * l, c -= e[_ +
									-64] * l, l = h[i + 4], f += e[t + 128] * l, c -= e[_ + -128] * l, l = h[i + 5], f += e[t + 192] * l, l = (c -=
									e[_ + -192] * l) - (f *= h[i + 6]), a[30 + 2 * o] = c + f, a[31 + 2 * o] = h[i + 7] * l, i += 18, t--, _++
						}
						c = e[t + -16] * h[i + -10], f = e[t + -32] * h[i + -2], c += (e[t + -48] - e[t + 16]) * h[i + -9], f += e[t + -
								96] * h[i + -1], c += (e[t + -80] + e[t + 48]) * h[i + -8], f += e[t + -160] * h[i + 0], c += (e[t + -112] - e[
								t + 80]) * h[i + -7], f += e[t + -224] * h[i + 1], c += (e[t + -144] + e[t + 112]) * h[i + -6], f -= e[t + 32] *
							h[i + 2], c += (e[t + -176] - e[t + 144]) * h[i + -5], f -= e[t + 96] * h[i + 3], c += (e[t + -208] + e[t + 176]) *
							h[i + -4], f -= e[t + 160] * h[i + 4], c += (e[t + -240] - e[t + 208]) * h[i + -3], s = (f -= e[t + 224]) - c,
							n = f + c, c = a[14], f = a[15] - c, a[31] = n + c, a[30] = s + f, a[15] = s - f, a[14] = n - c, r = a[28] - a[
								0], a[0] += a[28], a[28] = r * h[i + -36 + 7], r = a[29] - a[1], a[1] += a[29], a[29] = r * h[i + -36 + 7], r =
							a[26] - a[2], a[2] += a[26], a[26] = r * h[i + -72 + 7], r = a[27] - a[3], a[3] += a[27], a[27] = r * h[i + -72 +
								7], r = a[24] - a[4], a[4] += a[24], a[24] = r * h[i + -108 + 7], r = a[25] - a[5], a[5] += a[25], a[25] = r *
							h[i + -108 + 7], r = a[22] - a[6], a[6] += a[22], a[22] = r * ee.SQRT2, r = a[23] - a[7], a[7] += a[23], a[23] =
							r * ee.SQRT2 - a[7], a[7] -= a[6], a[22] -= a[7], a[23] -= a[22], r = a[6], a[6] = a[31] - r, a[31] = a[31] + r,
							r = a[7], a[7] = a[30] - r, a[30] = a[30] + r, r = a[22], a[22] = a[15] - r, a[15] = a[15] + r, r = a[23], a[23] =
							a[14] - r, a[14] = a[14] + r, r = a[20] - a[8], a[8] += a[20], a[20] = r * h[i + -180 + 7], r = a[21] - a[9], a[
								9] += a[21], a[21] = r * h[i + -180 + 7], r = a[18] - a[10], a[10] += a[18], a[18] = r * h[i + -216 + 7], r =
							a[19] - a[11], a[11] += a[19], a[19] = r * h[i + -216 + 7], r = a[16] - a[12], a[12] += a[16], a[16] = r * h[i +
								-252 + 7], r = a[17] - a[13], a[13] += a[17], a[17] = r * h[i + -252 + 7], r = -a[20] + a[24], a[20] += a[24],
							a[24] = r * h[i + -216 + 7], r = -a[21] + a[25], a[21] += a[25], a[25] = r * h[i + -216 + 7], r = a[4] - a[8],
							a[4] += a[8], a[8] = r * h[i + -216 + 7], r = a[5] - a[9], a[5] += a[9], a[9] = r * h[i + -216 + 7], r = a[0] -
							a[12], a[0] += a[12], a[12] = r * h[i + -72 + 7], r = a[1] - a[13], a[1] += a[13], a[13] = r * h[i + -72 + 7],
							r = a[16] - a[28], a[16] += a[28], a[28] = r * h[i + -72 + 7], r = -a[17] + a[29], a[17] += a[29], a[29] = r *
							h[i + -72 + 7], r = ee.SQRT2 * (a[2] - a[10]), a[2] += a[10], a[10] = r, r = ee.SQRT2 * (a[3] - a[11]), a[3] +=
							a[11], a[11] = r, r = ee.SQRT2 * (-a[18] + a[26]), a[18] += a[26], a[26] = r - a[18], r = ee.SQRT2 * (-a[19] +
								a[27]), a[19] += a[27], a[27] = r - a[19], r = a[2], a[19] -= a[3], a[3] -= r, a[2] = a[31] - r, a[31] += r, r =
							a[3], a[11] -= a[19], a[18] -= r, a[3] = a[30] - r, a[30] += r, r = a[18], a[27] -= a[11], a[19] -= r, a[18] =
							a[15] - r, a[15] += r, r = a[19], a[10] -= r, a[19] = a[14] - r, a[14] += r, r = a[10], a[11] -= r, a[10] = a[
								23] - r, a[23] += r, r = a[11], a[26] -= r, a[11] = a[22] - r, a[22] += r, r = a[26], a[27] -= r, a[26] = a[7] -
							r, a[7] += r, r = a[27], a[27] = a[6] - r, a[6] += r, r = ee.SQRT2 * (a[0] - a[4]), a[0] += a[4], a[4] = r, r =
							ee.SQRT2 * (a[1] - a[5]), a[1] += a[5], a[5] = r, r = ee.SQRT2 * (a[16] - a[20]), a[16] += a[20], a[20] = r, r =
							ee.SQRT2 * (a[17] - a[21]), a[17] += a[21], a[21] = r, r = -ee.SQRT2 * (a[8] - a[12]), a[8] += a[12], a[12] = r -
							a[8], r = -ee.SQRT2 * (a[9] - a[13]), a[9] += a[13], a[13] = r - a[9], r = -ee.SQRT2 * (a[25] - a[29]), a[25] +=
							a[29], a[29] = r - a[25], r = -ee.SQRT2 * (a[24] + a[28]), a[24] -= a[28], a[28] = r - a[24], r = a[24] - a[16],
							a[24] = r, r = a[20] - r, a[20] = r, r = a[28] - r, a[28] = r, r = a[25] - a[17], a[25] = r, r = a[21] - r, a[
								21] = r, r = a[29] - r, a[29] = r, r = a[17] - a[1], a[17] = r, r = a[9] - r, a[9] = r, r = a[25] - r, a[25] =
							r, r = a[5] - r, a[5] = r, r = a[21] - r, a[21] = r, r = a[13] - r, a[13] = r, r = a[29] - r, a[29] = r, r = a[
								1] - a[0], a[1] = r, r = a[16] - r, a[16] = r, r = a[17] - r, a[17] = r, r = a[8] - r, a[8] = r, r = a[9] - r,
							a[9] = r, r = a[24] - r, a[24] = r, r = a[25] - r, a[25] = r, r = a[4] - r, a[4] = r, r = a[5] - r, a[5] = r, r =
							a[20] - r, a[20] = r, r = a[21] - r, a[21] = r, r = a[12] - r, a[12] = r, r = a[13] - r, a[13] = r, r = a[28] -
							r, a[28] = r, r = a[29] - r, a[29] = r, r = a[0], a[0] += a[31], a[31] -= r, r = a[1], a[1] += a[30], a[30] -=
							r, r = a[16], a[16] += a[15], a[15] -= r, r = a[17], a[17] += a[14], a[14] -= r, r = a[8], a[8] += a[23], a[23] -=
							r, r = a[9], a[9] += a[22], a[22] -= r, r = a[24], a[24] += a[7], a[7] -= r, r = a[25], a[25] += a[6], a[6] -=
							r, r = a[4], a[4] += a[27], a[27] -= r, r = a[5], a[5] += a[26], a[26] -= r, r = a[20], a[20] += a[11], a[11] -=
							r, r = a[21], a[21] += a[10], a[10] -= r, r = a[12], a[12] += a[19], a[19] -= r, r = a[13], a[13] += a[18], a[
								18] -= r, r = a[28], a[28] += a[3], a[3] -= r, r = a[29], a[29] += a[2], a[2] -= r
					}

					function J(e, t) {
						for (var a = 0; a < 3; a++) {
							var s, n, r, i, _, o;
							n = (i = e[t + 6] * z[Pe.SHORT_TYPE][0] - e[t + 15]) + (s = e[t + 0] * z[Pe.SHORT_TYPE][2] - e[t + 9]), r = i -
								s, _ = (i = e[t + 15] * z[Pe.SHORT_TYPE][0] + e[t + 6]) + (s = e[t + 9] * z[Pe.SHORT_TYPE][2] + e[t + 0]), o = -
								i + s, s = 2.069978111953089e-11 * (e[t + 3] * z[Pe.SHORT_TYPE][1] - e[t + 12]), i = 2.069978111953089e-11 * (
									e[t + 12] * z[Pe.SHORT_TYPE][1] + e[t + 3]), e[t + 0] = 1.90752519173728e-11 * n + s, e[t + 15] =
								1.90752519173728e-11 * -_ + i, r = .8660254037844387 * r * 1.907525191737281e-11, _ = .5 * _ *
								1.907525191737281e-11 + i, e[t + 3] = r - _, e[t + 6] = r + _, n = .5 * n * 1.907525191737281e-11 - s, o =
								.8660254037844387 * o * 1.907525191737281e-11, e[t + 9] = n + o, e[t + 12] = n - o, t++
						}
					}
					this.mdct_sub48 = function(e, t, a) {
						for (var s, n, r, i, _, o, l, f, c, h, u, m, b, p, v, d, g, S, M, R, w, B = t, A = 286, T = 0; T < e.channels_out; T++) {
							for (var x = 0; x < e.mode_gr; x++) {
								for (var k, y = e.l3_side.tt[x][T], E = y.xr, P = 0, H = e.sb_sample[T][1 - x], I = 0, L = 0; L < 9; L++)
									for (W(B, A, H[I]), W(B, A + 32, H[I + 1]), I += 2, A += 64, k = 1; k < 32; k += 2) H[I - 1][k] *= -1;
								for (k = 0; k < 32; k++, P += 18) {
									var V = y.block_type,
										O = e.sb_sample[T][x],
										N = e.sb_sample[T][1 - x];
									if (0 != y.mixed_block_flag && k < 2 && (V = 0), e.amp_filter[k] < 1e-12) xe.fill(E, P + 0, P + 18, 0);
									else {
										if (e.amp_filter[k] < 1)
											for (L = 0; L < 18; L++) N[L][Q[k]] *= e.amp_filter[k];
										if (V == Pe.SHORT_TYPE) {
											for (L = -3; L < 0; L++) {
												var D = z[Pe.SHORT_TYPE][L + 3];
												E[P + 3 * L + 9] = O[9 + L][Q[k]] * D - O[8 - L][Q[k]], E[P + 3 * L + 18] = O[14 - L][Q[k]] * D + O[15 +
														L][Q[k]], E[P + 3 * L + 10] = O[15 + L][Q[k]] * D - O[14 - L][Q[k]], E[P + 3 * L + 19] = N[2 - L][Q[k]] *
													D + N[3 + L][Q[k]], E[P + 3 * L + 11] = N[3 + L][Q[k]] * D - N[2 - L][Q[k]], E[P + 3 * L + 20] = N[8 - L]
													[Q[k]] * D + N[9 + L][Q[k]]
											}
											J(E, P)
										} else {
											var Y = Ae(18);
											for (L = -9; L < 0; L++) {
												var C, X;
												C = z[V][L + 27] * N[L + 9][Q[k]] + z[V][L + 36] * N[8 - L][Q[k]], X = z[V][L + 9] * O[L + 9][Q[k]] - z[V]
													[L + 18] * O[8 - L][Q[k]], Y[L + 9] = C - X * Z[3 + L + 9], Y[L + 18] = C * Z[3 + L + 9] + X
											}
											s = E, n = P, w = R = M = S = g = d = v = p = b = m = u = h = c = f = l = o = _ = i = void 0, o = (r = Y)[
													17] - r[9], f = r[15] - r[11], c = r[14] - r[12], h = r[0] + r[8], u = r[1] + r[7], m = r[2] + r[6], b =
												r[3] + r[5], s[n + 17] = h + m - b - (u - r[4]), _ = (h + m - b) * K[19] + (u - r[4]), i = (o - f - c) *
												K[18], s[n + 5] = i + _, s[n + 6] = i - _, l = (r[16] - r[10]) * K[18], u = u * K[19] + r[4], i = o * K[
													12] + l + f * K[13] + c * K[14], _ = -h * K[16] + u - m * K[17] + b * K[15], s[n + 1] = i + _, s[n + 2] =
												i - _, i = o * K[13] - l - f * K[14] + c * K[12], _ = -h * K[17] + u - m * K[15] + b * K[16], s[n + 9] =
												i + _, s[n + 10] = i - _, i = o * K[14] - l + f * K[12] - c * K[13], _ = h * K[15] - u + m * K[16] - b *
												K[17], s[n + 13] = i + _, s[n + 14] = i - _, p = r[8] - r[0], d = r[6] - r[2], g = r[5] - r[3], S = r[17] +
												r[9], M = r[16] + r[10], R = r[15] + r[11], w = r[14] + r[12], s[n + 0] = S + R + w + (M + r[13]), i = (S +
													R + w) * K[19] - (M + r[13]), _ = (p - d + g) * K[18], s[n + 11] = i + _, s[n + 12] = i - _, v = (r[7] -
													r[1]) * K[18], M = r[13] - M * K[19], i = S * K[15] - M + R * K[16] + w * K[17], _ = p * K[14] + v + d *
												K[12] + g * K[13], s[n + 3] = i + _, s[n + 4] = i - _, i = -S * K[17] + M - R * K[15] - w * K[16], _ = p *
												K[13] + v - d * K[14] - g * K[12], s[n + 7] = i + _, s[n + 8] = i - _, i = -S * K[16] + M - R * K[17] - w *
												K[15], _ = p * K[12] - v + d * K[13] - g * K[14], s[n + 15] = i + _, s[n + 16] = i - _
										}
									}
									if (V != Pe.SHORT_TYPE && 0 != k)
										for (L = 7; 0 <= L; --L) {
											var q, j;
											q = E[P + L] * G[20 + L] + E[P + -1 - L] * U[28 + L], j = E[P + L] * U[28 + L] - E[P + -1 - L] * G[20 + L],
												E[P + -1 - L] = q, E[P + L] = j
										}
								}
							}
							if (B = a, A = 286, 1 == e.mode_gr)
								for (var F = 0; F < 18; F++) $.arraycopy(e.sb_sample[T][1][F], 0, e.sb_sample[T][0][F], 0, 32)
						}
					}
				};
				this.lame_encode_mp3_frame = function(e, t, a, s, n, r) {
					var i, _ = N([2, 2]);
					_[0][0] = new D, _[0][1] = new D, _[1][0] = new D, _[1][1] = new D;
					var o, l = N([2, 2]);
					l[0][0] = new D, l[0][1] = new D, l[1][0] = new D, l[1][1] = new D;
					var f, c, h, u = [null, null],
						m = e.internal_flags,
						b = Te([2, 4]),
						p = [.5, .5],
						v = [
							[0, 0],
							[0, 0]
						],
						d = [
							[0, 0],
							[0, 0]
						];
					if (u[0] = t, u[1] = a, 0 == m.lame_encode_frame_init && function(e, t) {
							var a, s, n = e.internal_flags;
							if (0 == n.lame_encode_frame_init) {
								var r, i, _ = Ae(2014),
									o = Ae(2014);
								for (n.lame_encode_frame_init = 1, i = r = 0; r < 286 + 576 * (1 + n.mode_gr); ++r) r < 576 * n.mode_gr ? (_[r] =
									0, 2 == n.channels_out && (o[r] = 0)) : (_[r] = t[0][i], 2 == n.channels_out && (o[r] = t[1][i]), ++i);
								for (s = 0; s < n.mode_gr; s++)
									for (a = 0; a < n.channels_out; a++) n.l3_side.tt[s][a].block_type = Pe.SHORT_TYPE;
								O.mdct_sub48(n, _, o)
							}
						}(e, u), m.padding = 0, (m.slot_lag -= m.frac_SpF) < 0 && (m.slot_lag += e.out_samplerate, m.padding = 1), 0 !=
						m.psymodel) {
						var g = [null, null],
							S = 0,
							M = Be(2);
						for (h = 0; h < m.mode_gr; h++) {
							for (c = 0; c < m.channels_out; c++) g[c] = u[c], S = 576 + 576 * h - Pe.FFTOFFSET;
							if (0 != (e.VBR == ye.vbr_mtrh || e.VBR == ye.vbr_mt ? I.L3psycho_anal_vbr(e, g, S, h, _, l, v[h], d[h], b[h],
									M) : I.L3psycho_anal_ns(e, g, S, h, _, l, v[h], d[h], b[h], M))) return -4;
							for (e.mode == Ee.JOINT_STEREO && (p[h] = b[h][2] + b[h][3], 0 < p[h] && (p[h] = b[h][3] / p[h])), c = 0; c < m
								.channels_out; c++) {
								var R = m.l3_side.tt[h][c];
								R.block_type = M[c], R.mixed_block_flag = 0
							}
						}
					} else
						for (h = 0; h < m.mode_gr; h++)
							for (c = 0; c < m.channels_out; c++) m.l3_side.tt[h][c].block_type = Pe.NORM_TYPE, m.l3_side.tt[h][c].mixed_block_flag =
								0, d[h][c] = v[h][c] = 700;
					if (function(e) {
							var t, a;
							if (0 != e.ATH.useAdjust)
								if (a = e.loudness_sq[0][0], t = e.loudness_sq[1][0], 2 == e.channels_out ? (a += e.loudness_sq[0][1], t += e.loudness_sq[
										1][1]) : (a += a, t += t), 2 == e.mode_gr && (a = Math.max(a, t)), a *= .5, .03125 < (a *= e.ATH.aaSensitivityP))
									1 <= e.ATH.adjust ? e.ATH.adjust = 1 : e.ATH.adjust < e.ATH.adjustLimit && (e.ATH.adjust = e.ATH.adjustLimit),
									e.ATH.adjustLimit = 1;
								else {
									var s = 31.98 * a + 625e-6;
									e.ATH.adjust >= s ? (e.ATH.adjust *= .075 * s + .925, e.ATH.adjust < s && (e.ATH.adjust = s)) : e.ATH.adjustLimit >=
										s ? e.ATH.adjust = s : e.ATH.adjust < e.ATH.adjustLimit && (e.ATH.adjust = e.ATH.adjustLimit), e.ATH.adjustLimit =
										s
								}
							else e.ATH.adjust = 1
						}(m), O.mdct_sub48(m, u[0], u[1]), m.mode_ext = Pe.MPG_MD_LR_LR, e.force_ms) m.mode_ext = Pe.MPG_MD_MS_LR;
					else if (e.mode == Ee.JOINT_STEREO) {
						var w = 0,
							B = 0;
						for (h = 0; h < m.mode_gr; h++)
							for (c = 0; c < m.channels_out; c++) w += d[h][c], B += v[h][c];
						if (w <= 1 * B) {
							var A = m.l3_side.tt[0],
								T = m.l3_side.tt[m.mode_gr - 1];
							A[0].block_type == A[1].block_type && T[0].block_type == T[1].block_type && (m.mode_ext = Pe.MPG_MD_MS_LR)
						}
					}
					if (m.mode_ext == P ? (o = l, f = d) : (o = _, f = v), e.analysis && null != m.pinfo)
						for (h = 0; h < m.mode_gr; h++)
							for (c = 0; c < m.channels_out; c++) m.pinfo.ms_ratio[h] = m.ms_ratio[h], m.pinfo.ms_ener_ratio[h] = p[h], m.pinfo
								.blocktype[h][c] = m.l3_side.tt[h][c].block_type, m.pinfo.pe[h][c] = f[h][c], $.arraycopy(m.l3_side.tt[h][c].xr,
									0, m.pinfo.xr[h][c], 0, 576), m.mode_ext == P && (m.pinfo.ers[h][c] = m.pinfo.ers[h][c + 2], $.arraycopy(m.pinfo
									.energy[h][c + 2], 0, m.pinfo.energy[h][c], 0, m.pinfo.energy[h][c].length));
					if (e.VBR == ye.vbr_off || e.VBR == ye.vbr_abr) {
						var x, k;
						for (x = 0; x < 18; x++) m.nsPsy.pefirbuf[x] = m.nsPsy.pefirbuf[x + 1];
						for (h = k = 0; h < m.mode_gr; h++)
							for (c = 0; c < m.channels_out; c++) k += f[h][c];
						for (m.nsPsy.pefirbuf[18] = k, k = m.nsPsy.pefirbuf[9], x = 0; x < 9; x++) k += (m.nsPsy.pefirbuf[x] + m.nsPsy.pefirbuf[
							18 - x]) * Pe.fircoef[x];
						for (k = 3350 * m.mode_gr * m.channels_out / k, h = 0; h < m.mode_gr; h++)
							for (c = 0; c < m.channels_out; c++) f[h][c] *= k
					}
					if (m.iteration_loop.iteration_loop(e, f, p, o), H.format_bitstream(e), i = H.copy_buffer(m, s, n, r, 1), e.bWriteVbrTag &&
						L.addVbrFrame(e), e.analysis && null != m.pinfo) {
						for (c = 0; c < m.channels_out; c++) {
							var y;
							for (y = 0; y < E; y++) m.pinfo.pcmdata[c][y] = m.pinfo.pcmdata[c][y + e.framesize];
							for (y = E; y < 1600; y++) m.pinfo.pcmdata[c][y] = u[c][y - E]
						}
						V.set_frame_pinfo(e, o)
					}
					return function(e) {
						var t, a;
						for (e.bitrate_stereoMode_Hist[e.bitrate_index][4]++, e.bitrate_stereoMode_Hist[15][4]++, 2 == e.channels_out &&
							(e.bitrate_stereoMode_Hist[e.bitrate_index][e.mode_ext]++, e.bitrate_stereoMode_Hist[15][e.mode_ext]++), t = 0; t <
							e.mode_gr; ++t)
							for (a = 0; a < e.channels_out; ++a) {
								var s = 0 | e.l3_side.tt[t][a].block_type;
								0 != e.l3_side.tt[t][a].mixed_block_flag && (s = 4), e.bitrate_blockType_Hist[e.bitrate_index][s]++, e.bitrate_blockType_Hist[
									e.bitrate_index][5]++, e.bitrate_blockType_Hist[15][s]++, e.bitrate_blockType_Hist[15][5]++
							}
					}(m), i
				}
			}

			function i() {
				this.l = Ae(Pe.SBMAX_l), this.s = Te([Pe.SBMAX_s, 3]);
				var s = this;
				this.assign = function(e) {
					$.arraycopy(e.l, 0, s.l, 0, Pe.SBMAX_l);
					for (var t = 0; t < Pe.SBMAX_s; t++)
						for (var a = 0; a < 3; a++) s.s[t][a] = e.s[t][a]
				}
			}

			function Z() {
				var e = 40;

				function t() {
					this.write_timing = 0, this.ptr = 0, this.buf = B(e)
				}
				this.Class_ID = 0, this.lame_encode_frame_init = 0, this.iteration_init_init = 0, this.fill_buffer_resample_init =
					0, this.mfbuf = Te([2, Z.MFSIZE]), this.mode_gr = 0, this.channels_in = 0, this.channels_out = 0, this.resample_ratio =
					0, this.mf_samples_to_encode = 0, this.mf_size = 0, this.VBR_min_bitrate = 0, this.VBR_max_bitrate = 0, this.bitrate_index =
					0, this.samplerate_index = 0, this.mode_ext = 0, this.lowpass1 = 0, this.lowpass2 = 0, this.highpass1 = 0, this.highpass2 =
					0, this.noise_shaping = 0, this.noise_shaping_amp = 0, this.substep_shaping = 0, this.psymodel = 0, this.noise_shaping_stop =
					0, this.subblock_gain = 0, this.use_best_huffman = 0, this.full_outer_loop = 0, this.l3_side = new function() {
						this.tt = [
							[null, null],
							[null, null]
						], this.main_data_begin = 0, this.private_bits = 0, this.resvDrain_pre = 0, this.resvDrain_post = 0, this.scfsi = [
							Be(4), Be(4)
						];
						for (var e = 0; e < 2; e++)
							for (var t = 0; t < 2; t++) this.tt[e][t] = new k
					}, this.ms_ratio = Ae(2), this.padding = 0, this.frac_SpF = 0, this.slot_lag = 0, this.tag_spec = null, this.nMusicCRC =
					0, this.OldValue = Be(2), this.CurrentStep = Be(2), this.masking_lower = 0, this.bv_scf = Be(576), this.pseudohalf =
					Be(z.SFBMAX), this.sfb21_extra = !1, this.inbuf_old = new Array(2), this.blackfilt = new Array(2 * Z.BPC + 1),
					this.itime = s(2), this.sideinfo_len = 0, this.sb_sample = Te([2, 2, 18, Pe.SBLIMIT]), this.amp_filter = Ae(32),
					this.header = new Array(Z.MAX_HEADER_BUF), this.h_ptr = 0, this.w_ptr = 0, this.ancillary_flag = 0, this.ResvSize =
					0, this.ResvMax = 0, this.scalefac_band = new r, this.minval_l = Ae(Pe.CBANDS), this.minval_s = Ae(Pe.CBANDS),
					this.nb_1 = Te([4, Pe.CBANDS]), this.nb_2 = Te([4, Pe.CBANDS]), this.nb_s1 = Te([4, Pe.CBANDS]), this.nb_s2 = Te([
						4, Pe.CBANDS
					]), this.s3_ss = null, this.s3_ll = null, this.decay = 0, this.thm = new Array(4), this.en = new Array(4), this.tot_ener =
					Ae(4), this.loudness_sq = Te([2, 2]), this.loudness_sq_save = Ae(2), this.mld_l = Ae(Pe.SBMAX_l), this.mld_s = Ae(
						Pe.SBMAX_s), this.bm_l = Be(Pe.SBMAX_l), this.bo_l = Be(Pe.SBMAX_l), this.bm_s = Be(Pe.SBMAX_s), this.bo_s = Be(
						Pe.SBMAX_s), this.npart_l = 0, this.npart_s = 0, this.s3ind = C([Pe.CBANDS, 2]), this.s3ind_s = C([Pe.CBANDS, 2]),
					this.numlines_s = Be(Pe.CBANDS), this.numlines_l = Be(Pe.CBANDS), this.rnumlines_l = Ae(Pe.CBANDS), this.mld_cb_l =
					Ae(Pe.CBANDS), this.mld_cb_s = Ae(Pe.CBANDS), this.numlines_s_num1 = 0, this.numlines_l_num1 = 0, this.pe = Ae(4),
					this.ms_ratio_s_old = 0, this.ms_ratio_l_old = 0, this.ms_ener_ratio_old = 0, this.blocktype_old = Be(2), this.nsPsy =
					new function() {
						this.last_en_subshort = Te([4, 9]), this.lastAttacks = Be(4), this.pefirbuf = Ae(19), this.longfact = Ae(Pe.SBMAX_l),
							this.shortfact = Ae(Pe.SBMAX_s), this.attackthre = 0, this.attackthre_s = 0
					}, this.VBR_seek_table = new function() {
						this.sum = 0, this.seen = 0, this.want = 0, this.pos = 0, this.size = 0, this.bag = null, this.nVbrNumFrames = 0,
							this.nBytesWritten = 0, this.TotalFrameSize = 0
					}, this.ATH = null, this.PSY = null, this.nogap_total = 0, this.nogap_current = 0, this.decode_on_the_fly = !0,
					this.findReplayGain = !0, this.findPeakSample = !0, this.PeakSample = 0, this.RadioGain = 0, this.AudiophileGain =
					0, this.rgdata = null, this.noclipGainChange = 0, this.noclipScale = 0, this.bitrate_stereoMode_Hist = C([16, 5]),
					this.bitrate_blockType_Hist = C([16, 6]), this.pinfo = null, this.hip = null, this.in_buffer_nsamples = 0, this.in_buffer_0 =
					null, this.in_buffer_1 = null, this.iteration_loop = null;
				for (var a = 0; a < this.en.length; a++) this.en[a] = new i;
				for (a = 0; a < this.thm.length; a++) this.thm[a] = new i;
				for (a = 0; a < this.header.length; a++) this.header[a] = new t
			}

			function G() {
				var A = new function() {
						var u = Ae(Pe.BLKSIZE),
							b = Ae(Pe.BLKSIZE_s / 2),
							x = [.9238795325112867, .3826834323650898, .9951847266721969, .0980171403295606, .9996988186962042,
								.02454122852291229, .9999811752826011, .006135884649154475
							];

						function p(e, t, a) {
							var s, n, r, i = 0,
								_ = t + (a <<= 1);
							s = 4;
							do {
								var o, l, f, c, h, u, m;
								for (m = s >> 1, u = (h = (c = s) << 1) + c, s = h << 1, r = (n = t) + m; M = e[n + 0] - e[n + c], S = e[n + 0] +
									e[n + c], A = e[n + h] - e[n + u], w = e[n + h] + e[n + u], e[n + h] = S - w, e[n + 0] = S + w, e[n + u] = M -
									A, e[n + c] = M + A, M = e[r + 0] - e[r + c], S = e[r + 0] + e[r + c], A = ee.SQRT2 * e[r + u], w = ee.SQRT2 *
									e[r + h], e[r + h] = S - w, e[r + 0] = S + w, e[r + u] = M - A, e[r + c] = M + A, r += s, (n += s) < _;);
								for (l = x[i + 0], o = x[i + 1], f = 1; f < m; f++) {
									var b, p;
									b = 1 - 2 * o * o, p = 2 * o * l, n = t + f, r = t + c - f;
									do {
										var v, d, g, S, M, R, w, B, A, T;
										d = p * e[n + c] - b * e[r + c], v = b * e[n + c] + p * e[r + c], M = e[n + 0] - v, S = e[n + 0] + v, R = e[r +
												0] - d, g = e[r + 0] + d, d = p * e[n + u] - b * e[r + u], v = b * e[n + u] + p * e[r + u], A = e[n + h] -
											v, w = e[n + h] + v, T = e[r + h] - d, B = e[r + h] + d, d = o * w - l * T, v = l * w + o * T, e[n + h] = S -
											v, e[n + 0] = S + v, e[r + u] = R - d, e[r + c] = R + d, d = l * B - o * A, v = o * B + l * A, e[r + h] = g -
											v, e[r + 0] = g + v, e[n + u] = M - d, e[n + c] = M + d, r += s, n += s
									} while (n < _);
									l = (b = l) * x[i + 0] - o * x[i + 1], o = b * x[i + 1] + o * x[i + 0]
								}
								i += 2
							} while (s < a)
						}
						var v = [0, 128, 64, 192, 32, 160, 96, 224, 16, 144, 80, 208, 48, 176, 112, 240, 8, 136, 72, 200, 40, 168, 104,
							232, 24, 152, 88, 216, 56, 184, 120, 248, 4, 132, 68, 196, 36, 164, 100, 228, 20, 148, 84, 212, 52, 180, 116,
							244, 12, 140, 76, 204, 44, 172, 108, 236, 28, 156, 92, 220, 60, 188, 124, 252, 2, 130, 66, 194, 34, 162, 98,
							226, 18, 146, 82, 210, 50, 178, 114, 242, 10, 138, 74, 202, 42, 170, 106, 234, 26, 154, 90, 218, 58, 186, 122,
							250, 6, 134, 70, 198, 38, 166, 102, 230, 22, 150, 86, 214, 54, 182, 118, 246, 14, 142, 78, 206, 46, 174, 110,
							238, 30, 158, 94, 222, 62, 190, 126, 254
						];
						this.fft_short = function(e, t, a, s, n) {
							for (var r = 0; r < 3; r++) {
								var i = Pe.BLKSIZE_s / 2,
									_ = 65535 & 192 * (r + 1),
									o = Pe.BLKSIZE_s / 8 - 1;
								do {
									var l, f, c, h, u, m = 255 & v[o << 2];
									f = (l = b[m] * s[a][n + m + _]) - (u = b[127 - m] * s[a][n + m + _ + 128]), l += u, h = (c = b[m + 64] * s[a]
										[n + m + _ + 64]) - (u = b[63 - m] * s[a][n + m + _ + 192]), c += u, i -= 4, t[r][i + 0] = l + c, t[r][i +
										2
									] = l - c, t[r][i + 1] = f + h, t[r][i + 3] = f - h, f = (l = b[m + 1] * s[a][n + m + _ + 1]) - (u = b[126 -
										m] * s[a][n + m + _ + 129]), l += u, h = (c = b[m + 65] * s[a][n + m + _ + 65]) - (u = b[62 - m] * s[a][n +
										m + _ + 193
									]), c += u, t[r][i + Pe.BLKSIZE_s / 2 + 0] = l + c, t[r][i + Pe.BLKSIZE_s / 2 + 2] = l - c, t[r][i + Pe.BLKSIZE_s /
										2 + 1
									] = f + h, t[r][i + Pe.BLKSIZE_s / 2 + 3] = f - h
								} while (0 <= --o);
								p(t[r], i, Pe.BLKSIZE_s / 2)
							}
						}, this.fft_long = function(e, t, a, s, n) {
							var r = Pe.BLKSIZE / 8 - 1,
								i = Pe.BLKSIZE / 2;
							do {
								var _, o, l, f, c, h = 255 & v[r];
								o = (_ = u[h] * s[a][n + h]) - (c = u[h + 512] * s[a][n + h + 512]), _ += c, f = (l = u[h + 256] * s[a][n + h +
										256
									]) - (c = u[h + 768] * s[a][n + h + 768]), l += c, t[0 + (i -= 4)] = _ + l, t[i + 2] = _ - l, t[i + 1] = o +
									f, t[i + 3] = o - f, o = (_ = u[h + 1] * s[a][n + h + 1]) - (c = u[h + 513] * s[a][n + h + 513]), _ += c, f =
									(l = u[h + 257] * s[a][n + h + 257]) - (c = u[h + 769] * s[a][n + h + 769]), l += c, t[i + Pe.BLKSIZE / 2 + 0] =
									_ + l, t[i + Pe.BLKSIZE / 2 + 2] = _ - l, t[i + Pe.BLKSIZE / 2 + 1] = o + f, t[i + Pe.BLKSIZE / 2 + 3] = o -
									f
							} while (0 <= --r);
							p(t, i, Pe.BLKSIZE / 2)
						}, this.init_fft = function(e) {
							for (var t = 0; t < Pe.BLKSIZE; t++) u[t] = .42 - .5 * Math.cos(2 * Math.PI * (t + .5) / Pe.BLKSIZE) + .08 *
								Math.cos(4 * Math.PI * (t + .5) / Pe.BLKSIZE);
							for (t = 0; t < Pe.BLKSIZE_s / 2; t++) b[t] = .5 * (1 - Math.cos(2 * Math.PI * (t + .5) / Pe.BLKSIZE_s))
						}
					},
					T = 2.302585092994046,
					oe = 2,
					le = 16,
					d = 2,
					g = 16,
					E = .34,
					n = 1 / 217621504 / (Pe.BLKSIZE / 2),
					fe = .3,
					ce = 21,
					S = .2302585093;

				function M(e) {
					return e
				}

				function D(e, t) {
					for (var a = 0, s = 0; s < Pe.BLKSIZE / 2; ++s) a += e[s] * t.ATH.eql_w[s];
					return a *= n
				}

				function he(e, t, a, s, n, r, i, _, o, l, f) {
					var c = e.internal_flags;
					if (o < 2) A.fft_long(c, s[n], o, l, f), A.fft_short(c, r[i], o, l, f);
					else if (2 == o) {
						for (var h = Pe.BLKSIZE - 1; 0 <= h; --h) {
							var u = s[n + 0][h],
								m = s[n + 1][h];
							s[n + 0][h] = (u + m) * ee.SQRT2 * .5, s[n + 1][h] = (u - m) * ee.SQRT2 * .5
						}
						for (var b = 2; 0 <= b; --b)
							for (h = Pe.BLKSIZE_s - 1; 0 <= h; --h) {
								u = r[i + 0][b][h], m = r[i + 1][b][h];
								r[i + 0][b][h] = (u + m) * ee.SQRT2 * .5, r[i + 1][b][h] = (u - m) * ee.SQRT2 * .5
							}
					}
					t[0] = M(s[n + 0][0]), t[0] *= t[0];
					for (h = Pe.BLKSIZE / 2 - 1; 0 <= h; --h) {
						var p = s[n + 0][Pe.BLKSIZE / 2 - h],
							v = s[n + 0][Pe.BLKSIZE / 2 + h];
						t[Pe.BLKSIZE / 2 - h] = M(.5 * (p * p + v * v))
					}
					for (b = 2; 0 <= b; --b) {
						a[b][0] = r[i + 0][b][0], a[b][0] *= a[b][0];
						for (h = Pe.BLKSIZE_s / 2 - 1; 0 <= h; --h) {
							p = r[i + 0][b][Pe.BLKSIZE_s / 2 - h], v = r[i + 0][b][Pe.BLKSIZE_s / 2 + h];
							a[b][Pe.BLKSIZE_s / 2 - h] = M(.5 * (p * p + v * v))
						}
					}
					var d = 0;
					for (h = 11; h < Pe.HBLKSIZE; h++) d += t[h];
					if (c.tot_ener[o] = d, e.analysis) {
						for (h = 0; h < Pe.HBLKSIZE; h++) c.pinfo.energy[_][o][h] = c.pinfo.energy_save[o][h], c.pinfo.energy_save[o][h] =
							t[h];
						c.pinfo.pe[_][o] = c.pe[o]
					}
					2 == e.athaa_loudapprox && o < 2 && (c.loudness_sq[_][o] = c.loudness_sq_save[o], c.loudness_sq_save[o] = D(t, c))
				}
				var x, k, y, P = 8,
					H = 23,
					I = 15,
					ue = [1, .79433, .63096, .63096, .63096, .63096, .63096, .25119, .11749];
				var f = [3.3246 * 3.3246, 3.23837 * 3.23837, 9.9500500969, 9.0247369744, 8.1854926609, 7.0440875649, 2.46209 *
						2.46209, 2.284 * 2.284, 4.4892710641, 1.96552 * 1.96552, 1.82335 * 1.82335, 1.69146 * 1.69146, 2.4621061921,
						2.1508568964, 1.37074 * 1.37074, 1.31036 * 1.31036, 1.5691069696, 1.4555939904, 1.16203 * 1.16203, 1.2715945225,
						1.09428 * 1.09428, 1.0659 * 1.0659, 1.0779838276, 1.0382591025, 1
					],
					c = [1.7782755904, 1.35879 * 1.35879, 1.38454 * 1.38454, 1.39497 * 1.39497, 1.40548 * 1.40548, 1.3537 * 1.3537,
						1.6999465924, 1.22321 * 1.22321, 1.3169398564, 1
					],
					h = [5.5396212496, 2.29259 * 2.29259, 4.9868695969, 2.12675 * 2.12675, 2.02545 * 2.02545, 1.87894 * 1.87894,
						1.74303 * 1.74303, 1.61695 * 1.61695, 2.2499700001, 1.39148 * 1.39148, 1.29083 * 1.29083, 1.19746 * 1.19746,
						1.2339655056, 1.0779838276
					];

				function me(e, t, a, s, n, r) {
					var i;
					if (e < t) {
						if (!(t < e * k)) return e + t;
						i = t / e
					} else {
						if (t * k <= e) return e + t;
						i = e / t
					}
					if (e += t, s + 3 <= 6) {
						if (x <= i) return e;
						var _ = 0 | ee.FAST_LOG10_X(i, 16);
						return e * c[_]
					}
					var o, l;
					_ = 0 | ee.FAST_LOG10_X(i, 16);
					return t = 0 != r ? n.ATH.cb_s[a] * n.ATH.adjust : n.ATH.cb_l[a] * n.ATH.adjust, e < y * t ? t < e ? (o = 1, _ <=
						13 && (o = h[_]), l = ee.FAST_LOG10_X(e / t, 10 / 15), e * ((f[_] - o) * l + o)) : 13 < _ ? e : e * h[_] : e * f[
						_]
				}
				var r = [1.7782755904, 1.35879 * 1.35879, 1.38454 * 1.38454, 1.39497 * 1.39497, 1.40548 * 1.40548, 1.3537 * 1.3537,
					1.6999465924, 1.22321 * 1.22321, 1.3169398564, 1
				];

				function B(e, t, a) {
					var s;
					if (e < 0 && (e = 0), t < 0 && (t = 0), e <= 0) return t;
					if (t <= 0) return e;
					if (s = e < t ? t / e : e / t, -2 <= a && a <= 2) {
						if (x <= s) return e + t;
						var n = 0 | ee.FAST_LOG10_X(s, 16);
						return (e + t) * r[n]
					}
					return s < k ? e + t : (e < t && (e = t), e)
				}

				function be(e, t, a, s, n) {
					var r, i, _ = 0,
						o = 0;
					for (r = i = 0; r < Pe.SBMAX_s; ++i, ++r) {
						for (var l = e.bo_s[r], f = e.npart_s, c = l < f ? l : f; i < c;) _ += t[i], o += a[i], i++;
						if (e.en[s].s[r][n] = _, e.thm[s].s[r][n] = o, f <= i) {
							++r;
							break
						}
						var h = e.PSY.bo_s_weight[r],
							u = 1 - h;
						_ = h * t[i], o = h * a[i], e.en[s].s[r][n] += _, e.thm[s].s[r][n] += o, _ = u * t[i], o = u * a[i]
					}
					for (; r < Pe.SBMAX_s; ++r) e.en[s].s[r][n] = 0, e.thm[s].s[r][n] = 0
				}

				function pe(e, t, a, s) {
					var n, r, i = 0,
						_ = 0;
					for (n = r = 0; n < Pe.SBMAX_l; ++r, ++n) {
						for (var o = e.bo_l[n], l = e.npart_l, f = o < l ? o : l; r < f;) i += t[r], _ += a[r], r++;
						if (e.en[s].l[n] = i, e.thm[s].l[n] = _, l <= r) {
							++n;
							break
						}
						var c = e.PSY.bo_l_weight[n],
							h = 1 - c;
						i = c * t[r], _ = c * a[r], e.en[s].l[n] += i, e.thm[s].l[n] += _, i = h * t[r], _ = h * a[r]
					}
					for (; n < Pe.SBMAX_l; ++n) e.en[s].l[n] = 0, e.thm[s].l[n] = 0
				}

				function ve(e, t, a, s, n, r) {
					var i, _, o = e.internal_flags;
					for (_ = i = 0; _ < o.npart_s; ++_) {
						for (var l = 0, f = 0, c = o.numlines_s[_], h = 0; h < c; ++h, ++i) {
							var u = t[r][i];
							l += u, f < u && (f = u)
						}
						a[_] = l
					}
					for (i = _ = 0; _ < o.npart_s; _++) {
						var m = o.s3ind_s[_][0],
							b = o.s3_ss[i++] * a[m];
						for (++m; m <= o.s3ind_s[_][1];) b += o.s3_ss[i] * a[m], ++i, ++m;
						var p = d * o.nb_s1[n][_];
						if (s[_] = Math.min(b, p), o.blocktype_old[1 & n] == Pe.SHORT_TYPE) {
							p = g * o.nb_s2[n][_];
							var v = s[_];
							s[_] = Math.min(p, v)
						}
						o.nb_s2[n][_] = o.nb_s1[n][_], o.nb_s1[n][_] = b
					}
					for (; _ <= Pe.CBANDS; ++_) a[_] = 0, s[_] = 0
				}

				function de(e, t, a) {
					return 1 <= a ? e : a <= 0 ? t : 0 < t ? Math.pow(e / t, a) * t : 0
				}
				var o = [11.8, 13.6, 17.2, 32, 46.5, 51.3, 57.5, 67.1, 71.5, 84.6, 97.6, 130];

				function ge(e, t) {
					for (var a = 309.07, s = 0; s < Pe.SBMAX_s - 1; s++)
						for (var n = 0; n < 3; n++) {
							var r = e.thm.s[s][n];
							if (0 < r) {
								var i = r * t,
									_ = e.en.s[s][n];
								i < _ && (a += 1e10 * i < _ ? o[s] * (10 * T) : o[s] * ee.FAST_LOG10(_ / i))
							}
						}
					return a
				}
				var _ = [6.8, 5.8, 5.8, 6.4, 6.5, 9.9, 12.1, 14.4, 15, 18.9, 21.6, 26.9, 34.2, 40.2, 46.8, 56.5, 60.7, 73.9, 85.7,
					93.4, 126.1
				];

				function Se(e, t) {
					for (var a = 281.0575, s = 0; s < Pe.SBMAX_l - 1; s++) {
						var n = e.thm.l[s];
						if (0 < n) {
							var r = n * t,
								i = e.en.l[s];
							r < i && (a += 1e10 * r < i ? _[s] * (10 * T) : _[s] * ee.FAST_LOG10(i / r))
						}
					}
					return a
				}

				function Me(e, t, a, s, n) {
					var r, i;
					for (r = i = 0; r < e.npart_l; ++r) {
						var _, o = 0,
							l = 0;
						for (_ = 0; _ < e.numlines_l[r]; ++_, ++i) {
							var f = t[i];
							o += f, l < f && (l = f)
						}
						a[r] = o, s[r] = l, n[r] = o * e.rnumlines_l[r]
					}
				}

				function Re(e, t, a, s) {
					var n = ue.length - 1,
						r = 0,
						i = a[r] + a[r + 1];
					0 < i ? ((_ = t[r]) < t[r + 1] && (_ = t[r + 1]), n < (o = 0 | (i = 20 * (2 * _ - i) / (i * (e.numlines_l[r] + e.numlines_l[
						r + 1] - 1)))) && (o = n), s[r] = o) : s[r] = 0;
					for (r = 1; r < e.npart_l - 1; r++) {
						var _, o;
						if (0 < (i = a[r - 1] + a[r] + a[r + 1]))(_ = t[r - 1]) < t[r] && (_ = t[r]), _ < t[r + 1] && (_ = t[r + 1]), n <
							(o = 0 | (i = 20 * (3 * _ - i) / (i * (e.numlines_l[r - 1] + e.numlines_l[r] + e.numlines_l[r + 1] - 1)))) && (o =
								n), s[r] = o;
						else s[r] = 0
					}
					0 < (i = a[r - 1] + a[r]) ? ((_ = t[r - 1]) < t[r] && (_ = t[r]), n < (o = 0 | (i = 20 * (2 * _ - i) / (i * (e.numlines_l[
						r - 1] + e.numlines_l[r] - 1)))) && (o = n), s[r] = o) : s[r] = 0
				}
				var we = [-1.730326e-17, -.01703172, -1.349528e-17, .0418072, -6.73278e-17, -.0876324, -3.0835e-17, .1863476, -
					1.104424e-16, -.627638
				];

				function Y(e, t, a, s, n, r, i, _) {
					var o = e.internal_flags;
					if (s < 2) A.fft_long(o, i[_], s, t, a);
					else if (2 == s)
						for (var l = Pe.BLKSIZE - 1; 0 <= l; --l) {
							var f = i[_ + 0][l],
								c = i[_ + 1][l];
							i[_ + 0][l] = (f + c) * ee.SQRT2 * .5, i[_ + 1][l] = (f - c) * ee.SQRT2 * .5
						}
					r[0] = M(i[_ + 0][0]), r[0] *= r[0];
					for (l = Pe.BLKSIZE / 2 - 1; 0 <= l; --l) {
						var h = i[_ + 0][Pe.BLKSIZE / 2 - l],
							u = i[_ + 0][Pe.BLKSIZE / 2 + l];
						r[Pe.BLKSIZE / 2 - l] = M(.5 * (h * h + u * u))
					}
					var m = 0;
					for (l = 11; l < Pe.HBLKSIZE; l++) m += r[l];
					if (o.tot_ener[s] = m, e.analysis) {
						for (l = 0; l < Pe.HBLKSIZE; l++) o.pinfo.energy[n][s][l] = o.pinfo.energy_save[s][l], o.pinfo.energy_save[s][l] =
							r[l];
						o.pinfo.pe[n][s] = o.pe[s]
					}
				}

				function C(e, t, a, s, n, r, i, _) {
					var o = e.internal_flags;
					if (0 == n && s < 2 && A.fft_short(o, i[_], s, t, a), 2 == s)
						for (var l = Pe.BLKSIZE_s - 1; 0 <= l; --l) {
							var f = i[_ + 0][n][l],
								c = i[_ + 1][n][l];
							i[_ + 0][n][l] = (f + c) * ee.SQRT2 * .5, i[_ + 1][n][l] = (f - c) * ee.SQRT2 * .5
						}
					r[n][0] = i[_ + 0][n][0], r[n][0] *= r[n][0];
					for (l = Pe.BLKSIZE_s / 2 - 1; 0 <= l; --l) {
						var h = i[_ + 0][n][Pe.BLKSIZE_s / 2 - l],
							u = i[_ + 0][n][Pe.BLKSIZE_s / 2 + l];
						r[n][Pe.BLKSIZE_s / 2 - l] = M(.5 * (h * h + u * u))
					}
				}
				this.L3psycho_anal_ns = function(e, t, a, s, n, r, i, _, o, l) {
					var f, c, h, u, m, b, p, v, d, g, S = e.internal_flags,
						M = Te([2, Pe.BLKSIZE]),
						R = Te([2, 3, Pe.BLKSIZE_s]),
						w = Ae(Pe.CBANDS + 1),
						B = Ae(Pe.CBANDS + 1),
						A = Ae(Pe.CBANDS + 2),
						T = Be(2),
						x = Be(2),
						k = Te([2, 576]),
						y = Be(Pe.CBANDS + 2),
						E = Be(Pe.CBANDS + 2);
					for (xe.fill(E, 0), f = S.channels_out, e.mode == Ee.JOINT_STEREO && (f = 4), d = e.VBR == ye.vbr_off ? 0 == S.ResvMax ?
						0 : S.ResvSize / S.ResvMax * .5 : e.VBR == ye.vbr_rh || e.VBR == ye.vbr_mtrh || e.VBR == ye.vbr_mt ? .6 : 1, c =
						0; c < S.channels_out; c++) {
						var P = t[c],
							H = a + 576 - 350 - ce + 192;
						for (u = 0; u < 576; u++) {
							var I, L;
							for (I = P[H + u + 10], m = L = 0; m < (ce - 1) / 2 - 1; m += 2) I += we[m] * (P[H + u + m] + P[H + u + ce - m]),
								L += we[m + 1] * (P[H + u + m + 1] + P[H + u + ce - m - 1]);
							k[c][u] = I + L
						}
						n[s][c].en.assign(S.en[c]), n[s][c].thm.assign(S.thm[c]), 2 < f && (r[s][c].en.assign(S.en[c + 2]), r[s][c].thm.assign(
							S.thm[c + 2]))
					}
					for (c = 0; c < f; c++) {
						var V, O = Ae(12),
							N = [0, 0, 0, 0],
							D = Ae(12),
							Y = 1,
							C = Ae(Pe.CBANDS),
							X = Ae(Pe.CBANDS),
							q = [0, 0, 0, 0],
							j = Ae(Pe.HBLKSIZE),
							F = Te([3, Pe.HBLKSIZE_s]);
						for (u = 0; u < 3; u++) O[u] = S.nsPsy.last_en_subshort[c][u + 6], D[u] = O[u] / S.nsPsy.last_en_subshort[c][u +
							4
						], N[0] += O[u];
						if (2 == c)
							for (u = 0; u < 576; u++) {
								var z, Z;
								z = k[0][u], Z = k[1][u], k[0][u] = z + Z, k[1][u] = z - Z
							}
						var K = k[1 & c],
							G = 0;
						for (u = 0; u < 9; u++) {
							for (var U = G + 64, Q = 1; G < U; G++) Q < Math.abs(K[G]) && (Q = Math.abs(K[G]));
							S.nsPsy.last_en_subshort[c][u] = O[u + 3] = Q, N[1 + u / 3] += Q, Q > O[u + 3 - 2] ? Q /= O[u + 3 - 2] : Q = O[
								u + 3 - 2] > 10 * Q ? O[u + 3 - 2] / (10 * Q) : 0, D[u + 3] = Q
						}
						if (e.analysis) {
							var W = D[0];
							for (u = 1; u < 12; u++) W < D[u] && (W = D[u]);
							S.pinfo.ers[s][c] = S.pinfo.ers_save[c], S.pinfo.ers_save[c] = W
						}
						for (V = 3 == c ? S.nsPsy.attackthre_s : S.nsPsy.attackthre, u = 0; u < 12; u++) 0 == q[u / 3] && D[u] > V && (q[
							u / 3] = u % 3 + 1);
						for (u = 1; u < 4; u++) {
							(N[u - 1] > N[u] ? N[u - 1] / N[u] : N[u] / N[u - 1]) < 1.7 && (q[u] = 0, 1 == u && (q[0] = 0))
						}
						for (0 != q[0] && 0 != S.nsPsy.lastAttacks[c] && (q[0] = 0), 3 != S.nsPsy.lastAttacks[c] && q[0] + q[1] + q[2] +
							q[3] == 0 || ((Y = 0) != q[1] && 0 != q[0] && (q[1] = 0), 0 != q[2] && 0 != q[1] && (q[2] = 0), 0 != q[3] && 0 !=
								q[2] && (q[3] = 0)), c < 2 ? x[c] = Y : 0 == Y && (x[0] = x[1] = 0), o[c] = S.tot_ener[c], he(e, j, F, M, 1 &
								c, R, 1 & c, s, c, t, a), Me(S, j, w, C, X), Re(S, C, X, y), v = 0; v < 3; v++) {
							var J, $;
							for (ve(e, F, B, A, c, v), be(S, B, A, c, v), p = 0; p < Pe.SBMAX_s; p++) {
								if ($ = S.thm[c].s[p][v], $ *= .8, 2 <= q[v] || 1 == q[v + 1]) {
									var ee = 0 != v ? v - 1 : 2;
									Q = de(S.thm[c].s[p][ee], $, .6 * d);
									$ = Math.min($, Q)
								}
								if (1 == q[v]) {
									ee = 0 != v ? v - 1 : 2, Q = de(S.thm[c].s[p][ee], $, fe * d);
									$ = Math.min($, Q)
								} else if (0 != v && 3 == q[v - 1] || 0 == v && 3 == S.nsPsy.lastAttacks[c]) {
									ee = 2 != v ? v + 1 : 0, Q = de(S.thm[c].s[p][ee], $, fe * d);
									$ = Math.min($, Q)
								}
								J = O[3 * v + 3] + O[3 * v + 4] + O[3 * v + 5], 6 * O[3 * v + 5] < J && ($ *= .5, 6 * O[3 * v + 4] < J && ($ *=
									.5)), S.thm[c].s[p][v] = $
							}
						}
						for (S.nsPsy.lastAttacks[c] = q[2], h = b = 0; h < S.npart_l; h++) {
							for (var te = S.s3ind[h][0], ae = w[te] * ue[y[te]], se = S.s3_ll[b++] * ae; ++te <= S.s3ind[h][1];) ae = w[te] *
								ue[y[te]], se = me(se, S.s3_ll[b++] * ae, te, te - h, S, 0);
							se *= .158489319246111, S.blocktype_old[1 & c] == Pe.SHORT_TYPE ? A[h] = se : A[h] = de(Math.min(se, Math.min(
								oe * S.nb_1[c][h], le * S.nb_2[c][h])), se, d), S.nb_2[c][h] = S.nb_1[c][h], S.nb_1[c][h] = se
						}
						for (; h <= Pe.CBANDS; ++h) w[h] = 0, A[h] = 0;
						pe(S, w, A, c)
					}(e.mode != Ee.STEREO && e.mode != Ee.JOINT_STEREO || 0 < e.interChRatio && function(e, t) {
						var a = e.internal_flags;
						if (1 < a.channels_out) {
							for (var s = 0; s < Pe.SBMAX_l; s++) {
								var n = a.thm[0].l[s],
									r = a.thm[1].l[s];
								a.thm[0].l[s] += r * t, a.thm[1].l[s] += n * t
							}
							for (s = 0; s < Pe.SBMAX_s; s++)
								for (var i = 0; i < 3; i++) n = a.thm[0].s[s][i], r = a.thm[1].s[s][i], a.thm[0].s[s][i] += r * t, a.thm[1].s[
									s][i] += n * t
						}
					}(e, e.interChRatio), e.mode == Ee.JOINT_STEREO) && (! function(e) {
						for (var t = 0; t < Pe.SBMAX_l; t++)
							if (!(e.thm[0].l[t] > 1.58 * e.thm[1].l[t] || e.thm[1].l[t] > 1.58 * e.thm[0].l[t])) {
								var a = e.mld_l[t] * e.en[3].l[t],
									s = Math.max(e.thm[2].l[t], Math.min(e.thm[3].l[t], a));
								a = e.mld_l[t] * e.en[2].l[t];
								var n = Math.max(e.thm[3].l[t], Math.min(e.thm[2].l[t], a));
								e.thm[2].l[t] = s, e.thm[3].l[t] = n
							} for (t = 0; t < Pe.SBMAX_s; t++)
							for (var r = 0; r < 3; r++) e.thm[0].s[t][r] > 1.58 * e.thm[1].s[t][r] || e.thm[1].s[t][r] > 1.58 * e.thm[0].s[
								t][r] || (a = e.mld_s[t] * e.en[3].s[t][r], s = Math.max(e.thm[2].s[t][r], Math.min(e.thm[3].s[t][r], a)), a =
								e.mld_s[t] * e.en[2].s[t][r], n = Math.max(e.thm[3].s[t][r], Math.min(e.thm[2].s[t][r], a)), e.thm[2].s[t][r] =
								s, e.thm[3].s[t][r] = n)
					}(S), g = e.msfix, 0 < Math.abs(g) && function(e, t, a) {
						var s = t,
							n = Math.pow(10, a);
						t *= 2, s *= 2;
						for (var r = 0; r < Pe.SBMAX_l; r++) f = e.ATH.cb_l[e.bm_l[r]] * n, (_ = Math.min(Math.max(e.thm[0].l[r], f),
							Math.max(e.thm[1].l[r], f))) * t < (o = Math.max(e.thm[2].l[r], f)) + (l = Math.max(e.thm[3].l[r], f)) && (o *=
							c = _ * s / (o + l), l *= c), e.thm[2].l[r] = Math.min(o, e.thm[2].l[r]), e.thm[3].l[r] = Math.min(l, e.thm[3]
							.l[r]);
						for (n *= Pe.BLKSIZE_s / Pe.BLKSIZE, r = 0; r < Pe.SBMAX_s; r++)
							for (var i = 0; i < 3; i++) {
								var _, o, l, f, c;
								f = e.ATH.cb_s[e.bm_s[r]] * n, (_ = Math.min(Math.max(e.thm[0].s[r][i], f), Math.max(e.thm[1].s[r][i], f))) *
									t < (o = Math.max(e.thm[2].s[r][i], f)) + (l = Math.max(e.thm[3].s[r][i], f)) && (o *= c = _ * t / (o + l),
										l *= c), e.thm[2].s[r][i] = Math.min(e.thm[2].s[r][i], o), e.thm[3].s[r][i] = Math.min(e.thm[3].s[r][i], l)
							}
					}(S, g, e.ATHlower * S.ATH.adjust));
					for (function(e, t, a, s) {
							var n = e.internal_flags;
							e.short_blocks != ke.short_block_coupled || 0 != t[0] && 0 != t[1] || (t[0] = t[1] = 0);
							for (var r = 0; r < n.channels_out; r++) s[r] = Pe.NORM_TYPE, e.short_blocks == ke.short_block_dispensed && (t[
									r] = 1), e.short_blocks == ke.short_block_forced && (t[r] = 0), 0 != t[r] ? n.blocktype_old[r] == Pe.SHORT_TYPE &&
								(s[r] = Pe.STOP_TYPE) : (s[r] = Pe.SHORT_TYPE, n.blocktype_old[r] == Pe.NORM_TYPE && (n.blocktype_old[r] = Pe.START_TYPE),
									n.blocktype_old[r] == Pe.STOP_TYPE && (n.blocktype_old[r] = Pe.SHORT_TYPE)), a[r] = n.blocktype_old[r], n.blocktype_old[
									r] = s[r]
						}(e, x, l, T), c = 0; c < f; c++) {
						var ne, re, ie, _e = 0;
						1 < c ? (ne = _, _e = -2, re = Pe.NORM_TYPE, l[0] != Pe.SHORT_TYPE && l[1] != Pe.SHORT_TYPE || (re = Pe.SHORT_TYPE),
								ie = r[s][c - 2]) : (ne = i, _e = 0, re = l[c], ie = n[s][c]), ne[_e + c] = re == Pe.SHORT_TYPE ? ge(ie, S.masking_lower) :
							Se(ie, S.masking_lower), e.analysis && (S.pinfo.pe[s][c] = ne[_e + c])
					}
					return 0
				};
				var X = [-1.730326e-17, -.01703172, -1.349528e-17, .0418072, -6.73278e-17, -.0876324, -3.0835e-17, .1863476, -
					1.104424e-16, -.627638
				];

				function q(e, t, a) {
					if (0 == a)
						for (var s = 0; s < e.npart_s; s++) e.nb_s2[t][s] = e.nb_s1[t][s], e.nb_s1[t][s] = 0
				}

				function j(e, t) {
					for (var a = 0; a < e.npart_l; a++) e.nb_2[t][a] = e.nb_1[t][a], e.nb_1[t][a] = 0
				}

				function F(e, t, a, s, n, r) {
					var i, _, o, l = e.internal_flags,
						f = new float[Pe.CBANDS],
						c = Ae(Pe.CBANDS),
						h = new int[Pe.CBANDS];
					for (o = _ = 0; o < l.npart_s; ++o) {
						var u = 0,
							m = 0,
							b = l.numlines_s[o];
						for (i = 0; i < b; ++i, ++_) {
							var p = t[r][_];
							u += p, m < p && (m = p)
						}
						a[o] = u, f[o] = m, c[o] = u / b
					}
					for (; o < Pe.CBANDS; ++o) f[o] = 0, c[o] = 0;
					for (function(e, t, a, s) {
							var n = ue.length - 1,
								r = 0,
								i = a[r] + a[r + 1];
							for (0 < i ? ((_ = t[r]) < t[r + 1] && (_ = t[r + 1]), n < (o = 0 | (i = 20 * (2 * _ - i) / (i * (e.numlines_s[r] +
									e.numlines_s[r + 1] - 1)))) && (o = n), s[r] = o) : s[r] = 0, r = 1; r < e.npart_s - 1; r++) {
								var _, o;
								0 < (i = a[r - 1] + a[r] + a[r + 1]) ? ((_ = t[r - 1]) < t[r] && (_ = t[r]), _ < t[r + 1] && (_ = t[r + 1]), n <
									(o = 0 | (i = 20 * (3 * _ - i) / (i * (e.numlines_s[r - 1] + e.numlines_s[r] + e.numlines_s[r + 1] - 1)))) &&
									(o = n), s[r] = o) : s[r] = 0
							}
							0 < (i = a[r - 1] + a[r]) ? ((_ = t[r - 1]) < t[r] && (_ = t[r]), n < (o = 0 | (i = 20 * (2 * _ - i) / (i * (e.numlines_s[
								r - 1] + e.numlines_s[r] - 1)))) && (o = n), s[r] = o) : s[r] = 0
						}(l, f, c, h), _ = o = 0; o < l.npart_s; o++) {
						var v, d, g, S, M, R = l.s3ind_s[o][0],
							w = l.s3ind_s[o][1];
						for (v = h[R], d = 1, S = l.s3_ss[_] * a[R] * ue[h[R]], ++_, ++R; R <= w;) v += h[R], d += 1, S = B(S, g = l.s3_ss[
							_] * a[R] * ue[h[R]], R - o), ++_, ++R;
						S *= M = .5 * ue[v = (1 + 2 * v) / (2 * d)], s[o] = S, l.nb_s2[n][o] = l.nb_s1[n][o], l.nb_s1[n][o] = S, g = f[o],
							g *= l.minval_s[o], g *= M, s[o] > g && (s[o] = g), 1 < l.masking_lower && (s[o] *= l.masking_lower), s[o] > a[o] &&
							(s[o] = a[o]), l.masking_lower < 1 && (s[o] *= l.masking_lower)
					}
					for (; o < Pe.CBANDS; ++o) a[o] = 0, s[o] = 0
				}

				function z(e, t, a, s, n) {
					var r, i = Ae(Pe.CBANDS),
						_ = Ae(Pe.CBANDS),
						o = Be(Pe.CBANDS + 2);
					Me(e, t, a, i, _), Re(e, i, _, o);
					var l = 0;
					for (r = 0; r < e.npart_l; r++) {
						var f, c, h, u = e.s3ind[r][0],
							m = e.s3ind[r][1],
							b = 0,
							p = 0;
						for (b = o[u], p += 1, c = e.s3_ll[l] * a[u] * ue[o[u]], ++l, ++u; u <= m;) b += o[u], p += 1, c = B(c, f = e.s3_ll[
							l] * a[u] * ue[o[u]], u - r), ++l, ++u;
						if (c *= h = .5 * ue[b = (1 + 2 * b) / (2 * p)], e.blocktype_old[1 & n] == Pe.SHORT_TYPE) {
							var v = oe * e.nb_1[n][r];
							s[r] = 0 < v ? Math.min(c, v) : Math.min(c, a[r] * fe)
						} else {
							var d = le * e.nb_2[n][r],
								g = oe * e.nb_1[n][r];
							d <= 0 && (d = c), g <= 0 && (g = c), v = e.blocktype_old[1 & n] == Pe.NORM_TYPE ? Math.min(g, d) : g, s[r] =
								Math.min(c, v)
						}
						e.nb_2[n][r] = e.nb_1[n][r], e.nb_1[n][r] = c, f = i[r], f *= e.minval_l[r], f *= h, s[r] > f && (s[r] = f), 1 <
							e.masking_lower && (s[r] *= e.masking_lower), s[r] > a[r] && (s[r] = a[r]), e.masking_lower < 1 && (s[r] *= e.masking_lower)
					}
					for (; r < Pe.CBANDS; ++r) a[r] = 0, s[r] = 0
				}

				function Z(e, t, a, s, n, r, i) {
					for (var _, o, l = 2 * r, f = 0 < r ? Math.pow(10, n) : 1, c = 0; c < i; ++c) {
						var h = e[2][c],
							u = e[3][c],
							m = t[0][c],
							b = t[1][c],
							p = t[2][c],
							v = t[3][c];
						if (m <= 1.58 * b && b <= 1.58 * m) {
							var d = a[c] * u,
								g = a[c] * h;
							o = Math.max(p, Math.min(v, d)), _ = Math.max(v, Math.min(p, g))
						} else o = p, _ = v;
						if (0 < r) {
							var S, M, R = s[c] * f;
							if (S = Math.min(Math.max(m, R), Math.max(b, R)), 0 < (M = (p = Math.max(o, R)) + (v = Math.max(_, R))) && S * l <
								M) {
								var w = S * l / M;
								p *= w, v *= w
							}
							o = Math.min(p, o), _ = Math.min(v, _)
						}
						h < o && (o = h), u < _ && (_ = u), t[2][c] = o, t[3][c] = _
					}
				}

				function R(e, t) {
					var a;
					return (a = 0 <= e ? 27 * -e : e * t) <= -72 ? 0 : Math.exp(a * S)
				}

				function w(e) {
					var t, a, s = 0;
					for (s = 0; 1e-20 < R(s, e); s -= 1);
					for (n = s, r = 0; 1e-12 < Math.abs(r - n);) 0 < R(s = (r + n) / 2, e) ? r = s : n = s;
					t = n;
					var n, r;
					s = 0;
					for (s = 0; 1e-20 < R(s, e); s += 1);
					for (n = 0, r = s; 1e-12 < Math.abs(r - n);) 0 < R(s = (r + n) / 2, e) ? n = s : r = s;
					a = r;
					var i, _ = 0;
					for (i = 0; i <= 1e3; ++i) {
						_ += R(s = t + i * (a - t) / 1e3, e)
					}
					return 1001 / (_ * (a - t))
				}

				function L(e) {
					return e < 0 && (e = 0), e *= .001, 13 * Math.atan(.76 * e) + 3.5 * Math.atan(e * e / 56.25)
				}

				function V(e, t, a, s, n, r, i, _, o, l, f, c) {
					var h, u = Ae(Pe.CBANDS + 1),
						m = _ / (15 < c ? 1152 : 384),
						b = Be(Pe.HBLKSIZE);
					_ /= o;
					var p = 0,
						v = 0;
					for (h = 0; h < Pe.CBANDS; h++) {
						var d;
						for (x = L(_ * p), u[h] = _ * p, d = p; L(_ * d) - x < E && d <= o / 2; d++);
						for (e[h] = d - p, v = h + 1; p < d;) b[p++] = h;
						if (o / 2 < p) {
							p = o / 2, ++h;
							break
						}
					}
					u[h] = _ * p;
					for (var g = 0; g < c; g++) {
						var S, M, R, w, B;
						R = l[g], w = l[g + 1], (S = 0 | Math.floor(.5 + f * (R - .5))) < 0 && (S = 0), o / 2 < (M = 0 | Math.floor(.5 +
							f * (w - .5))) && (M = o / 2), a[g] = (b[S] + b[M]) / 2, t[g] = b[M];
						var A = m * w;
						i[g] = (A - u[t[g]]) / (u[t[g] + 1] - u[t[g]]), i[g] < 0 ? i[g] = 0 : 1 < i[g] && (i[g] = 1), B = L(_ * l[g] * f),
							B = Math.min(B, 15.5) / 15.5, r[g] = Math.pow(10, 1.25 * (1 - Math.cos(Math.PI * B)) - 2.5)
					}
					for (var T = p = 0; T < v; T++) {
						var x, k, y = e[T];
						x = L(_ * p), k = L(_ * (p + y - 1)), s[T] = .5 * (x + k), x = L(_ * (p - .5)), k = L(_ * (p + y - .5)), n[T] = k -
							x, p += y
					}
					return v
				}

				function O(e, t, a, s, n, r) {
					var i, _, o, l, f, c, h = Te([Pe.CBANDS, Pe.CBANDS]),
						u = 0;
					if (r)
						for (var m = 0; m < t; m++)
							for (i = 0; i < t; i++) {
								var b = (_ = a[m] - a[i], c = f = l = o = void 0, o = _, l = .5 <= (o *= 0 <= o ? 3 : 1.5) && o <= 2.5 ? 8 * ((
									c = o - .5) * c - 2 * c) : 0, ((f = 15.811389 + 7.5 * (o += .474) - 17.5 * Math.sqrt(1 + o * o)) <= -60 ? 0 :
									(o = Math.exp((l + f) * S), o /= .6609193)) * s[i]);
								h[m][i] = b * n[m]
							} else
								for (i = 0; i < t; i++) {
									var p = 15 + Math.min(21 / a[i], 12),
										v = w(p);
									for (m = 0; m < t; m++) {
										b = v * R(a[m] - a[i], p) * s[i];
										h[m][i] = b * n[m]
									}
								}
					for (m = 0; m < t; m++) {
						for (i = 0; i < t && !(0 < h[m][i]); i++);
						for (e[m][0] = i, i = t - 1; 0 < i && !(0 < h[m][i]); i--);
						e[m][1] = i, u += e[m][1] - e[m][0] + 1
					}
					var d = Ae(u),
						g = 0;
					for (m = 0; m < t; m++)
						for (i = e[m][0]; i <= e[m][1]; i++) d[g++] = h[m][i];
					return d
				}

				function N(e) {
					var t = L(e);
					return t = Math.min(t, 15.5) / 15.5, Math.pow(10, 1.25 * (1 - Math.cos(Math.PI * t)) - 2.5)
				}

				function s(e, t) {
					return e < -.3 && (e = 3410), e /= 1e3, e = Math.max(.1, e), 3.64 * Math.pow(e, -.8) - 6.8 * Math.exp(-.6 * Math.pow(
						e - 3.4, 2)) + 6 * Math.exp(-.15 * Math.pow(e - 8.7, 2)) + .001 * (.6 + .04 * t) * Math.pow(e, 4)
				}
				this.L3psycho_anal_vbr = function(e, t, a, s, n, r, i, _, o, l) {
					var f, c, h, u, m, b = e.internal_flags,
						p = Ae(Pe.HBLKSIZE),
						v = Te([3, Pe.HBLKSIZE_s]),
						d = Te([2, Pe.BLKSIZE]),
						g = Te([2, 3, Pe.BLKSIZE_s]),
						S = Te([4, Pe.CBANDS]),
						M = Te([4, Pe.CBANDS]),
						R = Te([4, 3]),
						w = [
							[0, 0, 0, 0],
							[0, 0, 0, 0],
							[0, 0, 0, 0],
							[0, 0, 0, 0]
						],
						B = Be(2),
						A = e.mode == Ee.JOINT_STEREO ? 4 : b.channels_out;
					! function(e, t, a, s, n, r, i, _, o, l) {
						for (var f = Te([2, 576]), c = e.internal_flags, h = c.channels_out, u = e.mode == Ee.JOINT_STEREO ? 4 : h, m =
								0; m < h; m++) {
							firbuf = t[m];
							for (var b = a + 576 - 350 - ce + 192, p = 0; p < 576; p++) {
								var v, d;
								v = firbuf[b + p + 10];
								for (var g = d = 0; g < (ce - 1) / 2 - 1; g += 2) v += X[g] * (firbuf[b + p + g] + firbuf[b + p + ce - g]), d +=
									X[g + 1] * (firbuf[b + p + g + 1] + firbuf[b + p + ce - g - 1]);
								f[m][p] = v + d
							}
							n[s][m].en.assign(c.en[m]), n[s][m].thm.assign(c.thm[m]), 2 < u && (r[s][m].en.assign(c.en[m + 2]), r[s][m].thm
								.assign(c.thm[m + 2]))
						}
						for (m = 0; m < u; m++) {
							var S = Ae(12),
								M = Ae(12),
								R = [0, 0, 0, 0],
								w = f[1 & m],
								B = 0,
								A = 3 == m ? c.nsPsy.attackthre_s : c.nsPsy.attackthre,
								T = 1;
							if (2 == m)
								for (p = 0, g = 576; 0 < g; ++p, --g) {
									var x = f[0][p],
										k = f[1][p];
									f[0][p] = x + k, f[1][p] = x - k
								}
							for (p = 0; p < 3; p++) M[p] = c.nsPsy.last_en_subshort[m][p + 6], S[p] = M[p] / c.nsPsy.last_en_subshort[m][p +
								4
							], R[0] += M[p];
							for (p = 0; p < 9; p++) {
								for (var y = B + 64, E = 1; B < y; B++) E < Math.abs(w[B]) && (E = Math.abs(w[B]));
								c.nsPsy.last_en_subshort[m][p] = M[p + 3] = E, R[1 + p / 3] += E, E > M[p + 3 - 2] ? E /= M[p + 3 - 2] : E = M[
									p + 3 - 2] > 10 * E ? M[p + 3 - 2] / (10 * E) : 0, S[p + 3] = E
							}
							for (p = 0; p < 3; ++p) {
								var P = M[3 * p + 3] + M[3 * p + 4] + M[3 * p + 5],
									H = 1;
								6 * M[3 * p + 5] < P && (H *= .5, 6 * M[3 * p + 4] < P && (H *= .5)), _[m][p] = H
							}
							if (e.analysis) {
								var I = S[0];
								for (p = 1; p < 12; p++) I < S[p] && (I = S[p]);
								c.pinfo.ers[s][m] = c.pinfo.ers_save[m], c.pinfo.ers_save[m] = I
							}
							for (p = 0; p < 12; p++) 0 == o[m][p / 3] && S[p] > A && (o[m][p / 3] = p % 3 + 1);
							for (p = 1; p < 4; p++) {
								var L = R[p - 1],
									V = R[p];
								Math.max(L, V) < 4e4 && L < 1.7 * V && V < 1.7 * L && (1 == p && o[m][0] <= o[m][p] && (o[m][0] = 0), o[m][p] =
									0)
							}
							o[m][0] <= c.nsPsy.lastAttacks[m] && (o[m][0] = 0), 3 != c.nsPsy.lastAttacks[m] && o[m][0] + o[m][1] + o[m][2] +
								o[m][3] == 0 || ((T = 0) != o[m][1] && 0 != o[m][0] && (o[m][1] = 0), 0 != o[m][2] && 0 != o[m][1] && (o[m][2] =
									0), 0 != o[m][3] && 0 != o[m][2] && (o[m][3] = 0)), m < 2 ? l[m] = T : 0 == T && (l[0] = l[1] = 0), i[m] = c.tot_ener[
									m]
						}
					}(e, t, a, s, n, r, o, R, w, B),
					function(e, t) {
						var a = e.internal_flags;
						e.short_blocks != ke.short_block_coupled || 0 != t[0] && 0 != t[1] || (t[0] = t[1] = 0);
						for (var s = 0; s < a.channels_out; s++) e.short_blocks == ke.short_block_dispensed && (t[s] = 1), e.short_blocks ==
							ke.short_block_forced && (t[s] = 0)
					}(e, B);
					for (var T = 0; T < A; T++) {
						Y(e, t, a, T, s, p, d, k = 1 & T), c = s, h = T, u = p, m = void 0, m = (f = e).internal_flags, 2 == f.athaa_loudapprox &&
							h < 2 && (m.loudness_sq[c][h] = m.loudness_sq_save[h], m.loudness_sq_save[h] = D(u, m)), 0 != B[k] ? z(b, p, S[
								T], M[T], T) : j(b, T)
					}
					B[0] + B[1] == 2 && e.mode == Ee.JOINT_STEREO && Z(S, M, b.mld_cb_l, b.ATH.cb_l, e.ATHlower * b.ATH.adjust, e.msfix,
						b.npart_l);
					for (T = 0; T < A; T++) {
						0 != B[k = 1 & T] && pe(b, S[T], M[T], T)
					}
					for (var x = 0; x < 3; x++) {
						for (T = 0; T < A; ++T) {
							0 != B[k = 1 & T] ? q(b, T, x) : (C(e, t, a, T, x, v, g, k), F(e, v, S[T], M[T], T, x))
						}
						B[0] + B[1] == 0 && e.mode == Ee.JOINT_STEREO && Z(S, M, b.mld_cb_s, b.ATH.cb_s, e.ATHlower * b.ATH.adjust, e.msfix,
							b.npart_s);
						for (T = 0; T < A; ++T) {
							0 == B[k = 1 & T] && be(b, S[T], M[T], T, x)
						}
					}
					for (T = 0; T < A; T++) {
						var k;
						if (0 == B[k = 1 & T])
							for (var y = 0; y < Pe.SBMAX_s; y++) {
								var E = Ae(3);
								for (x = 0; x < 3; x++) {
									var P = b.thm[T].s[y][x];
									if (P *= .8, 2 <= w[T][x] || 1 == w[T][x + 1]) {
										var H = 0 != x ? x - 1 : 2,
											I = de(b.thm[T].s[y][H], P, .36);
										P = Math.min(P, I)
									} else if (1 == w[T][x]) {
										H = 0 != x ? x - 1 : 2, I = de(b.thm[T].s[y][H], P, .6 * fe);
										P = Math.min(P, I)
									} else if (0 != x && 3 == w[T][x - 1] || 0 == x && 3 == b.nsPsy.lastAttacks[T]) {
										H = 2 != x ? x + 1 : 0, I = de(b.thm[T].s[y][H], P, .6 * fe);
										P = Math.min(P, I)
									}
									P *= R[T][x], E[x] = P
								}
								for (x = 0; x < 3; x++) b.thm[T].s[y][x] = E[x]
							}
					}
					for (T = 0; T < A; T++) b.nsPsy.lastAttacks[T] = w[T][2];
					! function(e, t, a) {
						for (var s = e.internal_flags, n = 0; n < s.channels_out; n++) {
							var r = Pe.NORM_TYPE;
							0 != t[n] ? s.blocktype_old[n] == Pe.SHORT_TYPE && (r = Pe.STOP_TYPE) : (r = Pe.SHORT_TYPE, s.blocktype_old[n] ==
								Pe.NORM_TYPE && (s.blocktype_old[n] = Pe.START_TYPE), s.blocktype_old[n] == Pe.STOP_TYPE && (s.blocktype_old[
									n] = Pe.SHORT_TYPE)), a[n] = s.blocktype_old[n], s.blocktype_old[n] = r
						}
					}(e, B, l);
					for (T = 0; T < A; T++) {
						var L, V, O, N;
						1 < T ? (L = _, V = -2, O = Pe.NORM_TYPE, l[0] != Pe.SHORT_TYPE && l[1] != Pe.SHORT_TYPE || (O = Pe.SHORT_TYPE),
								N = r[s][T - 2]) : (L = i, V = 0, O = l[T], N = n[s][T]), L[V + T] = O == Pe.SHORT_TYPE ? ge(N, b.masking_lower) :
							Se(N, b.masking_lower), e.analysis && (b.pinfo.pe[s][T] = L[V + T])
					}
					return 0
				}, this.psymodel_init = function(e) {
					var t, a = e.internal_flags,
						s = !0,
						n = 13,
						r = 0,
						i = 0,
						_ = -8.25,
						o = -4.5,
						l = Ae(Pe.CBANDS),
						f = Ae(Pe.CBANDS),
						c = Ae(Pe.CBANDS),
						h = e.out_samplerate;
					switch (e.experimentalZ) {
						default:
						case 0:
							s = !0;
							break;
						case 1:
							s = e.VBR != ye.vbr_mtrh && e.VBR != ye.vbr_mt;
							break;
						case 2:
							s = !1;
							break;
						case 3:
							n = 8, r = -1.75, i = -.0125, _ = -8.25, o = -2.25
					}
					for (a.ms_ener_ratio_old = .25, a.blocktype_old[0] = a.blocktype_old[1] = Pe.NORM_TYPE, t = 0; t < 4; ++t) {
						for (var u = 0; u < Pe.CBANDS; ++u) a.nb_1[t][u] = 1e20, a.nb_2[t][u] = 1e20, a.nb_s1[t][u] = a.nb_s2[t][u] = 1;
						for (var m = 0; m < Pe.SBMAX_l; m++) a.en[t].l[m] = 1e20, a.thm[t].l[m] = 1e20;
						for (u = 0; u < 3; ++u) {
							for (m = 0; m < Pe.SBMAX_s; m++) a.en[t].s[m][u] = 1e20, a.thm[t].s[m][u] = 1e20;
							a.nsPsy.lastAttacks[t] = 0
						}
						for (u = 0; u < 9; u++) a.nsPsy.last_en_subshort[t][u] = 10
					}
					for (a.loudness_sq_save[0] = a.loudness_sq_save[1] = 0, a.npart_l = V(a.numlines_l, a.bo_l, a.bm_l, l, f, a.mld_l,
							a.PSY.bo_l_weight, h, Pe.BLKSIZE, a.scalefac_band.l, Pe.BLKSIZE / 1152, Pe.SBMAX_l), t = 0; t < a.npart_l; t++) {
						var b = r;
						l[t] >= n && (b = i * (l[t] - n) / (24 - n) + r * (24 - l[t]) / (24 - n)), c[t] = Math.pow(10, b / 10), 0 < a.numlines_l[
							t] ? a.rnumlines_l[t] = 1 / a.numlines_l[t] : a.rnumlines_l[t] = 0
					}
					a.s3_ll = O(a.s3ind, a.npart_l, l, f, c, s);
					var p;
					u = 0;
					for (t = 0; t < a.npart_l; t++) {
						g = K.MAX_VALUE;
						for (var v = 0; v < a.numlines_l[t]; v++, u++) {
							var d = h * u / (1e3 * Pe.BLKSIZE);
							S = this.ATHformula(1e3 * d, e) - 20, S = Math.pow(10, .1 * S), (S *= a.numlines_l[t]) < g && (g = S)
						}
						a.ATH.cb_l[t] = g, 6 < (g = 20 * l[t] / 10 - 20) && (g = 100), g < -15 && (g = -15), g -= 8, a.minval_l[t] =
							Math.pow(10, g / 10) * a.numlines_l[t]
					}
					for (a.npart_s = V(a.numlines_s, a.bo_s, a.bm_s, l, f, a.mld_s, a.PSY.bo_s_weight, h, Pe.BLKSIZE_s, a.scalefac_band
							.s, Pe.BLKSIZE_s / 384, Pe.SBMAX_s), t = u = 0; t < a.npart_s; t++) {
						var g;
						b = _;
						l[t] >= n && (b = o * (l[t] - n) / (24 - n) + _ * (24 - l[t]) / (24 - n)), c[t] = Math.pow(10, b / 10), g = K.MAX_VALUE;
						for (v = 0; v < a.numlines_s[t]; v++, u++) {
							var S;
							d = h * u / (1e3 * Pe.BLKSIZE_s);
							S = this.ATHformula(1e3 * d, e) - 20, S = Math.pow(10, .1 * S), (S *= a.numlines_s[t]) < g && (g = S)
						}
						a.ATH.cb_s[t] = g, g = 7 * l[t] / 12 - 7, 12 < l[t] && (g *= 1 + 3.1 * Math.log(1 + g)), l[t] < 12 && (g *= 1 +
							2.3 * Math.log(1 - g)), g < -15 && (g = -15), g -= 8, a.minval_s[t] = Math.pow(10, g / 10) * a.numlines_s[t]
					}
					a.s3_ss = O(a.s3ind_s, a.npart_s, l, f, c, s), x = Math.pow(10, (P + 1) / 16), k = Math.pow(10, (H + 1) / 16), y =
						Math.pow(10, I / 10), A.init_fft(a), a.decay = Math.exp(-1 * T / (.01 * h / 192)), p = 3.5, 0 != (2 & e.exp_nspsytune) &&
						(p = 1), 0 < Math.abs(e.msfix) && (p = e.msfix), e.msfix = p;
					for (var M = 0; M < a.npart_l; M++) a.s3ind[M][1] > a.npart_l - 1 && (a.s3ind[M][1] = a.npart_l - 1);
					var R = 576 * a.mode_gr / h;
					if (a.ATH.decay = Math.pow(10, -1.2 * R), a.ATH.adjust = .01, -(a.ATH.adjustLimit = 1) != e.ATHtype) {
						var w = e.out_samplerate / Pe.BLKSIZE,
							B = 0;
						for (t = d = 0; t < Pe.BLKSIZE / 2; ++t) d += w, a.ATH.eql_w[t] = 1 / Math.pow(10, this.ATHformula(d, e) / 10),
							B += a.ATH.eql_w[t];
						for (B = 1 / B, t = Pe.BLKSIZE / 2; 0 <= --t;) a.ATH.eql_w[t] *= B
					}
					for (M = u = 0; M < a.npart_s; ++M)
						for (t = 0; t < a.numlines_s[M]; ++t) ++u;
					for (M = u = 0; M < a.npart_l; ++M)
						for (t = 0; t < a.numlines_l[M]; ++t) ++u;
					for (t = u = 0; t < a.npart_l; t++) {
						d = h * (u + a.numlines_l[t] / 2) / (1 * Pe.BLKSIZE);
						a.mld_cb_l[t] = N(d), u += a.numlines_l[t]
					}
					for (; t < Pe.CBANDS; ++t) a.mld_cb_l[t] = 1;
					for (t = u = 0; t < a.npart_s; t++) {
						d = h * (u + a.numlines_s[t] / 2) / (1 * Pe.BLKSIZE_s);
						a.mld_cb_s[t] = N(d), u += a.numlines_s[t]
					}
					for (; t < Pe.CBANDS; ++t) a.mld_cb_s[t] = 1;
					return 0
				}, this.ATHformula = function(e, t) {
					var a;
					switch (t.ATHtype) {
						case 0:
							a = s(e, 9);
							break;
						case 1:
							a = s(e, -1);
							break;
						case 2:
							a = s(e, 0);
							break;
						case 3:
							a = s(e, 1) + 6;
							break;
						case 4:
							a = s(e, t.ATHcurve);
							break;
						default:
							a = s(e, 0)
					}
					return a
				}
			}

			function U() {
				var _ = this;
				U.V9 = 410, U.V8 = 420, U.V7 = 430, U.V6 = 440, U.V5 = 450, U.V4 = 460, U.V3 = 470, U.V2 = 480, U.V1 = 490, U.V0 =
					500, U.R3MIX = 1e3, U.STANDARD = 1001, U.EXTREME = 1002, U.INSANE = 1003, U.STANDARD_FAST = 1004, U.EXTREME_FAST =
					1005, U.MEDIUM = 1006, U.MEDIUM_FAST = 1007;
				var R, w, g, S, M;
				U.LAME_MAXMP3BUFFER = 147456;
				var B, A, T, x = new G;

				function k() {
					this.lowerlimit = 0
				}

				function n(e, t) {
					this.lowpass = t
				}
				this.enc = new Pe, this.setModules = function(e, t, a, s, n, r, i, _, o) {
					R = e, w = t, g = a, S = s, M = n, B = r, i, A = _, T = o, this.enc.setModules(w, x, S, B)
				};
				var y = 4294479419;

				function E(e) {
					return 1 < e ? 0 : e <= 0 ? 1 : Math.cos(Math.PI / 2 * e)
				}

				function P(e, t) {
					switch (e) {
						case 44100:
							return t.version = 1, 0;
						case 48e3:
							return t.version = 1;
						case 32e3:
							return t.version = 1, 2;
						case 22050:
							return t.version = 0;
						case 24e3:
							return t.version = 0, 1;
						case 16e3:
							return t.version = 0, 2;
						case 11025:
							return t.version = 0;
						case 12e3:
							return t.version = 0, 1;
						case 8e3:
							return t.version = 0, 2;
						default:
							return t.version = 0, -1
					}
				}

				function H(e, t, a) {
					a < 16e3 && (t = 2);
					for (var s = j.bitrate_table[t][1], n = 2; n <= 14; n++) 0 < j.bitrate_table[t][n] && Math.abs(j.bitrate_table[t][
						n
					] - e) < Math.abs(s - e) && (s = j.bitrate_table[t][n]);
					return s
				}

				function I(e, t, a) {
					a < 16e3 && (t = 2);
					for (var s = 0; s <= 14; s++)
						if (0 < j.bitrate_table[t][s] && j.bitrate_table[t][s] == e) return s;
					return -1
				}

				function L(e, t) {
					var a = [new n(8, 2e3), new n(16, 3700), new n(24, 3900), new n(32, 5500), new n(40, 7e3), new n(48, 7500), new n(
							56, 1e4), new n(64, 11e3), new n(80, 13500), new n(96, 15100), new n(112, 15600), new n(128, 17e3), new n(160,
							17500), new n(192, 18600), new n(224, 19400), new n(256, 19700), new n(320, 20500)],
						s = _.nearestBitrateFullIndex(t);
					e.lowerlimit = a[s].lowpass
				}

				function V(e) {
					var t = Pe.BLKSIZE + e.framesize - Pe.FFTOFFSET;
					return t = Math.max(t, 512 + e.framesize - 32)
				}

				function O(e, t, a, s, n, r) {
					var i = _.enc.lame_encode_mp3_frame(e, t, a, s, n, r);
					return e.frameNum++, i
				}

				function N() {
					this.n_in = 0, this.n_out = 0
				}

				function f() {
					this.num_used = 0
				}

				function D(e, t, a) {
					var s = Math.PI * t;
					(e /= a) < 0 && (e = 0), 1 < e && (e = 1);
					var n = e - .5,
						r = .42 - .5 * Math.cos(2 * e * Math.PI) + .08 * Math.cos(4 * e * Math.PI);
					return Math.abs(n) < 1e-9 ? s / Math.PI : r * Math.sin(a * s * n) / (Math.PI * a * n)
				}

				function c(e, t, a, s, n, r, i, _, o) {
					var l, f, c = e.internal_flags,
						h = 0,
						u = e.out_samplerate / function e(t, a) {
							return 0 != a ? e(a, t % a) : t
						}(e.out_samplerate, e.in_samplerate);
					Z.BPC < u && (u = Z.BPC);
					var m = Math.abs(c.resample_ratio - Math.floor(.5 + c.resample_ratio)) < 1e-4 ? 1 : 0,
						b = 1 / c.resample_ratio;
					1 < b && (b = 1);
					var p = 31;
					0 == p % 2 && --p;
					var v = (p += m) + 1;
					if (0 == c.fill_buffer_resample_init) {
						for (c.inbuf_old[0] = Ae(v), c.inbuf_old[1] = Ae(v), l = 0; l <= 2 * u; ++l) c.blackfilt[l] = Ae(v);
						for (c.itime[0] = 0, h = c.itime[1] = 0; h <= 2 * u; h++) {
							var d = 0,
								g = (h - u) / (2 * u);
							for (l = 0; l <= p; l++) d += c.blackfilt[h][l] = D(l - g, b, p);
							for (l = 0; l <= p; l++) c.blackfilt[h][l] /= d
						}
						c.fill_buffer_resample_init = 1
					}
					var S = c.inbuf_old[o];
					for (f = 0; f < s; f++) {
						var M, R;
						if (M = f * c.resample_ratio, i <= p + (h = 0 | Math.floor(M - c.itime[o])) - p / 2) break;
						g = M - c.itime[o] - (h + p % 2 * .5);
						R = 0 | Math.floor(2 * g * u + u + .5);
						var w = 0;
						for (l = 0; l <= p; ++l) {
							var B = l + h - p / 2;
							w += (B < 0 ? S[v + B] : n[r + B]) * c.blackfilt[R][l]
						}
						t[a + f] = w
					}
					if (_.num_used = Math.min(i, p + h - p / 2), c.itime[o] += _.num_used - f * c.resample_ratio, _.num_used >= v)
						for (l = 0; l < v; l++) S[l] = n[r + _.num_used + l - v];
					else {
						var A = v - _.num_used;
						for (l = 0; l < A; ++l) S[l] = S[l + _.num_used];
						for (h = 0; l < v; ++l, ++h) S[l] = n[r + h]
					}
					return f
				}

				function Y(e, t, a, s, n, r) {
					var i = e.internal_flags;
					if (i.resample_ratio < .9999 || 1.0001 < i.resample_ratio)
						for (var _ = 0; _ < i.channels_out; _++) {
							var o = new f;
							r.n_out = c(e, t[_], i.mf_size, e.framesize, a[_], s, n, o, _), r.n_in = o.num_used
						} else {
							r.n_out = Math.min(e.framesize, n), r.n_in = r.n_out;
							for (var l = 0; l < r.n_out; ++l) t[0][i.mf_size + l] = a[0][s + l], 2 == i.channels_out && (t[1][i.mf_size + l] =
								a[1][s + l])
						}
				}
				this.lame_init = function() {
					var e, t, a = new function() {
						this.class_id = 0, this.num_samples = 0, this.num_channels = 0, this.in_samplerate = 0, this.out_samplerate = 0,
							this.scale = 0, this.scale_left = 0, this.scale_right = 0, this.analysis = !1, this.bWriteVbrTag = !1, this.decode_only = !
							1, this.quality = 0, this.mode = Ee.STEREO, this.force_ms = !1, this.free_format = !1, this.findReplayGain = !
							1, this.decode_on_the_fly = !1, this.write_id3tag_automatic = !1, this.brate = 0, this.compression_ratio = 0,
							this.copyright = 0, this.original = 0, this.extension = 0, this.emphasis = 0, this.error_protection = 0, this.strict_ISO = !
							1, this.disable_reservoir = !1, this.quant_comp = 0, this.quant_comp_short = 0, this.experimentalY = !1, this.experimentalZ =
							0, this.exp_nspsytune = 0, this.preset = 0, this.VBR = null, this.VBR_q_frac = 0, this.VBR_q = 0, this.VBR_mean_bitrate_kbps =
							0, this.VBR_min_bitrate_kbps = 0, this.VBR_max_bitrate_kbps = 0, this.VBR_hard_min = 0, this.lowpassfreq = 0,
							this.highpassfreq = 0, this.lowpasswidth = 0, this.highpasswidth = 0, this.maskingadjust = 0, this.maskingadjust_short =
							0, this.ATHonly = !1, this.ATHshort = !1, this.noATH = !1, this.ATHtype = 0, this.ATHcurve = 0, this.ATHlower =
							0, this.athaa_type = 0, this.athaa_loudapprox = 0, this.athaa_sensitivity = 0, this.short_blocks = null, this.useTemporal = !
							1, this.interChRatio = 0, this.msfix = 0, this.tune = !1, this.tune_value_a = 0, this.version = 0, this.encoder_delay =
							0, this.encoder_padding = 0, this.framesize = 0, this.frameNum = 0, this.lame_allocated_gfp = 0, this.internal_flags =
							null
					};
					return 0 != ((e = a).class_id = y, t = e.internal_flags = new Z, e.mode = Ee.NOT_SET, e.original = 1, e.in_samplerate =
						44100, e.num_channels = 2, e.num_samples = -1, e.bWriteVbrTag = !0, e.quality = -1, e.short_blocks = null, t.subblock_gain = -
						1, e.lowpassfreq = 0, e.highpassfreq = 0, e.lowpasswidth = -1, e.highpasswidth = -1, e.VBR = ye.vbr_off, e.VBR_q =
						4, e.ATHcurve = -1, e.VBR_mean_bitrate_kbps = 128, e.VBR_min_bitrate_kbps = 0, e.VBR_max_bitrate_kbps = 0, e.VBR_hard_min =
						0, t.VBR_min_bitrate = 1, t.VBR_max_bitrate = 13, e.quant_comp = -1, e.quant_comp_short = -1, e.msfix = -1, t.resample_ratio =
						1, t.OldValue[0] = 180, t.OldValue[1] = 180, t.CurrentStep[0] = 4, t.CurrentStep[1] = 4, t.masking_lower = 1, t
						.nsPsy.attackthre = -1, t.nsPsy.attackthre_s = -1, e.scale = -1, e.athaa_type = -1, e.ATHtype = -1, e.athaa_loudapprox = -
						1, e.athaa_sensitivity = 0, e.useTemporal = null, e.interChRatio = -1, t.mf_samples_to_encode = Pe.ENCDELAY +
						Pe.POSTDELAY, e.encoder_padding = 0, t.mf_size = Pe.ENCDELAY - Pe.MDCTDELAY, e.findReplayGain = !1, e.decode_on_the_fly = !
						1, t.decode_on_the_fly = !1, t.findReplayGain = !1, t.findPeakSample = !1, t.RadioGain = 0, t.AudiophileGain =
						0, t.noclipGainChange = 0, t.noclipScale = -1, e.preset = 0, e.write_id3tag_automatic = !0, 0) ? null : (a.lame_allocated_gfp =
						1, a)
				}, this.nearestBitrateFullIndex = function(e) {
					var t = [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
						a = 0,
						s = 0,
						n = 0,
						r = 0;
					r = t[16], s = t[n = 16], a = 16;
					for (var i = 0; i < 16; i++)
						if (Math.max(e, t[i + 1]) != e) {
							r = t[i + 1], n = i + 1, s = t[i], a = i;
							break
						} return e - s < r - e ? a : n
				}, this.lame_init_params = function(e) {
					var t, a, s, n = e.internal_flags;
					if (n.Class_ID = 0, null == n.ATH && (n.ATH = new function() {
							this.useAdjust = 0, this.aaSensitivityP = 0, this.adjust = 0, this.adjustLimit = 0, this.decay = 0, this.floor =
								0, this.l = Ae(Pe.SBMAX_l), this.s = Ae(Pe.SBMAX_s), this.psfb21 = Ae(Pe.PSFB21), this.psfb12 = Ae(Pe.PSFB12),
								this.cb_l = Ae(Pe.CBANDS), this.cb_s = Ae(Pe.CBANDS), this.eql_w = Ae(Pe.BLKSIZE / 2)
						}), null == n.PSY && (n.PSY = new function() {
							this.mask_adjust = 0, this.mask_adjust_short = 0, this.bo_l_weight = Ae(Pe.SBMAX_l), this.bo_s_weight = Ae(Pe.SBMAX_s)
						}), null == n.rgdata && (n.rgdata = new function() {}), n.channels_in = e.num_channels, 1 == n.channels_in && (e
							.mode = Ee.MONO), n.channels_out = e.mode == Ee.MONO ? 1 : 2, n.mode_ext = Pe.MPG_MD_MS_LR, e.mode == Ee.MONO &&
						(e.force_ms = !1), e.VBR == ye.vbr_off && 128 != e.VBR_mean_bitrate_kbps && 0 == e.brate && (e.brate = e.VBR_mean_bitrate_kbps),
						e.VBR == ye.vbr_off || e.VBR == ye.vbr_mtrh || e.VBR == ye.vbr_mt || (e.free_format = !1), e.VBR == ye.vbr_off &&
						0 == e.brate && q.EQ(e.compression_ratio, 0) && (e.compression_ratio = 11.025), e.VBR == ye.vbr_off && 0 < e.compression_ratio &&
						(0 == e.out_samplerate && (e.out_samplerate = map2MP3Frequency(int(.97 * e.in_samplerate))), e.brate = 0 | 16 *
							e.out_samplerate * n.channels_out / (1e3 * e.compression_ratio), n.samplerate_index = P(e.out_samplerate, e), e
							.free_format || (e.brate = H(e.brate, e.version, e.out_samplerate))), 0 != e.out_samplerate && (e.out_samplerate <
							16e3 ? (e.VBR_mean_bitrate_kbps = Math.max(e.VBR_mean_bitrate_kbps, 8), e.VBR_mean_bitrate_kbps = Math.min(e.VBR_mean_bitrate_kbps,
								64)) : e.out_samplerate < 32e3 ? (e.VBR_mean_bitrate_kbps = Math.max(e.VBR_mean_bitrate_kbps, 8), e.VBR_mean_bitrate_kbps =
								Math.min(e.VBR_mean_bitrate_kbps, 160)) : (e.VBR_mean_bitrate_kbps = Math.max(e.VBR_mean_bitrate_kbps, 32), e.VBR_mean_bitrate_kbps =
								Math.min(e.VBR_mean_bitrate_kbps, 320))), 0 == e.lowpassfreq) {
						var r = 16e3;
						switch (e.VBR) {
							case ye.vbr_off:
								L(i = new k, e.brate), r = i.lowerlimit;
								break;
							case ye.vbr_abr:
								var i;
								L(i = new k, e.VBR_mean_bitrate_kbps), r = i.lowerlimit;
								break;
							case ye.vbr_rh:
								var _ = [19500, 19e3, 18600, 18e3, 17500, 16e3, 15600, 14900, 12500, 1e4, 3950];
								if (0 <= e.VBR_q && e.VBR_q <= 9) {
									var o = _[e.VBR_q],
										l = _[e.VBR_q + 1],
										f = e.VBR_q_frac;
									r = linear_int(o, l, f)
								} else r = 19500;
								break;
							default:
								_ = [19500, 19e3, 18500, 18e3, 17500, 16500, 15500, 14500, 12500, 9500, 3950];
								if (0 <= e.VBR_q && e.VBR_q <= 9) {
									o = _[e.VBR_q], l = _[e.VBR_q + 1], f = e.VBR_q_frac;
									r = linear_int(o, l, f)
								} else r = 19500
						}
						e.mode != Ee.MONO || e.VBR != ye.vbr_off && e.VBR != ye.vbr_abr || (r *= 1.5), e.lowpassfreq = 0 | r
					}
					if (0 == e.out_samplerate && (2 * e.lowpassfreq > e.in_samplerate && (e.lowpassfreq = e.in_samplerate / 2), e.out_samplerate =
							(t = 0 | e.lowpassfreq, a = e.in_samplerate, s = 44100, 48e3 <= a ? s = 48e3 : 44100 <= a ? s = 44100 : 32e3 <=
								a ? s = 32e3 : 24e3 <= a ? s = 24e3 : 22050 <= a ? s = 22050 : 16e3 <= a ? s = 16e3 : 12e3 <= a ? s = 12e3 :
								11025 <= a ? s = 11025 : 8e3 <= a && (s = 8e3), -1 == t ? s : (t <= 15960 && (s = 44100), t <= 15250 && (s =
										32e3), t <= 11220 && (s = 24e3), t <= 9970 && (s = 22050), t <= 7230 && (s = 16e3), t <= 5420 && (s = 12e3),
									t <= 4510 && (s = 11025), t <= 3970 && (s = 8e3), a < s ? 44100 < a ? 48e3 : 32e3 < a ? 44100 : 24e3 < a ?
									32e3 : 22050 < a ? 24e3 : 16e3 < a ? 22050 : 12e3 < a ? 16e3 : 11025 < a ? 12e3 : 8e3 < a ? 11025 : 8e3 : s))
						), e.lowpassfreq = Math.min(20500, e.lowpassfreq), e.lowpassfreq = Math.min(e.out_samplerate / 2, e.lowpassfreq),
						e.VBR == ye.vbr_off && (e.compression_ratio = 16 * e.out_samplerate * n.channels_out / (1e3 * e.brate)), e.VBR ==
						ye.vbr_abr && (e.compression_ratio = 16 * e.out_samplerate * n.channels_out / (1e3 * e.VBR_mean_bitrate_kbps)),
						e.bWriteVbrTag || (e.findReplayGain = !1, e.decode_on_the_fly = !1, n.findPeakSample = !1), n.findReplayGain = e
						.findReplayGain, n.decode_on_the_fly = e.decode_on_the_fly, n.decode_on_the_fly && (n.findPeakSample = !0), n.findReplayGain &&
						R.InitGainAnalysis(n.rgdata, e.out_samplerate) == X.INIT_GAIN_ANALYSIS_ERROR) return e.internal_flags = null, -6;
					switch (n.decode_on_the_fly && !e.decode_only && (null != n.hip && T.hip_decode_exit(n.hip), n.hip = T.hip_decode_init()),
						n.mode_gr = e.out_samplerate <= 24e3 ? 1 : 2, e.framesize = 576 * n.mode_gr, e.encoder_delay = Pe.ENCDELAY, n.resample_ratio =
						e.in_samplerate / e.out_samplerate, e.VBR) {
						case ye.vbr_mt:
						case ye.vbr_rh:
						case ye.vbr_mtrh:
							e.compression_ratio = [5.7, 6.5, 7.3, 8.2, 10, 11.9, 13, 14, 15, 16.5][e.VBR_q];
							break;
						case ye.vbr_abr:
							e.compression_ratio = 16 * e.out_samplerate * n.channels_out / (1e3 * e.VBR_mean_bitrate_kbps);
							break;
						default:
							e.compression_ratio = 16 * e.out_samplerate * n.channels_out / (1e3 * e.brate)
					}
					if (e.mode == Ee.NOT_SET && (e.mode = Ee.JOINT_STEREO), 0 < e.highpassfreq ? (n.highpass1 = 2 * e.highpassfreq, 0 <=
							e.highpasswidth ? n.highpass2 = 2 * (e.highpassfreq + e.highpasswidth) : n.highpass2 = 2 * e.highpassfreq, n.highpass1 /=
							e.out_samplerate, n.highpass2 /= e.out_samplerate) : (n.highpass1 = 0, n.highpass2 = 0), 0 < e.lowpassfreq ? (n
							.lowpass2 = 2 * e.lowpassfreq, 0 <= e.lowpasswidth ? (n.lowpass1 = 2 * (e.lowpassfreq - e.lowpasswidth), n.lowpass1 <
								0 && (n.lowpass1 = 0)) : n.lowpass1 = 2 * e.lowpassfreq, n.lowpass1 /= e.out_samplerate, n.lowpass2 /= e.out_samplerate
						) : (n.lowpass1 = 0, n.lowpass2 = 0), function(e) {
							var t = e.internal_flags,
								a = 32,
								s = -1;
							if (0 < t.lowpass1) {
								for (var n = 999, r = 0; r <= 31; r++)(l = r / 31) >= t.lowpass2 && (a = Math.min(a, r)), t.lowpass1 < l && l <
									t.lowpass2 && (n = Math.min(n, r));
								t.lowpass1 = 999 == n ? (a - .75) / 31 : (n - .75) / 31, t.lowpass2 = a / 31
							}
							if (0 < t.highpass2 && t.highpass2 < .75 / 31 * .9 && (t.highpass1 = 0, t.highpass2 = 0, $.err.println(
									"Warning: highpass filter disabled.  highpass frequency too small\n")), 0 < t.highpass2) {
								var i = -1;
								for (r = 0; r <= 31; r++)(l = r / 31) <= t.highpass1 && (s = Math.max(s, r)), t.highpass1 < l && l < t.highpass2 &&
									(i = Math.max(i, r));
								t.highpass1 = s / 31, t.highpass2 = -1 == i ? (s + .75) / 31 : (i + .75) / 31
							}
							for (r = 0; r < 32; r++) {
								var _, o, l = r / 31;
								_ = t.highpass2 > t.highpass1 ? E((t.highpass2 - l) / (t.highpass2 - t.highpass1 + 1e-20)) : 1, o = t.lowpass2 >
									t.lowpass1 ? E((l - t.lowpass1) / (t.lowpass2 - t.lowpass1 + 1e-20)) : 1, t.amp_filter[r] = _ * o
							}
						}(e), n.samplerate_index = P(e.out_samplerate, e), n.samplerate_index < 0) return e.internal_flags = null, -1;
					if (e.VBR == ye.vbr_off) {
						if (e.free_format) n.bitrate_index = 0;
						else if (e.brate = H(e.brate, e.version, e.out_samplerate), n.bitrate_index = I(e.brate, e.version, e.out_samplerate),
							n.bitrate_index <= 0) return e.internal_flags = null, -1
					} else n.bitrate_index = 1;
					e.analysis && (e.bWriteVbrTag = !1), null != n.pinfo && (e.bWriteVbrTag = !1), w.init_bit_stream_w(n);
					for (var c, h, u, m = n.samplerate_index + 3 * e.version + 6 * (e.out_samplerate < 16e3 ? 1 : 0), b = 0; b < Pe.SBMAX_l +
						1; b++) n.scalefac_band.l[b] = S.sfBandIndex[m].l[b];
					for (b = 0; b < Pe.PSFB21 + 1; b++) {
						var p = (n.scalefac_band.l[22] - n.scalefac_band.l[21]) / Pe.PSFB21,
							v = n.scalefac_band.l[21] + b * p;
						n.scalefac_band.psfb21[b] = v
					}
					n.scalefac_band.psfb21[Pe.PSFB21] = 576;
					for (b = 0; b < Pe.SBMAX_s + 1; b++) n.scalefac_band.s[b] = S.sfBandIndex[m].s[b];
					for (b = 0; b < Pe.PSFB12 + 1; b++) {
						p = (n.scalefac_band.s[13] - n.scalefac_band.s[12]) / Pe.PSFB12, v = n.scalefac_band.s[12] + b * p;
						n.scalefac_band.psfb12[b] = v
					}
					for (n.scalefac_band.psfb12[Pe.PSFB12] = 192, 1 == e.version ? n.sideinfo_len = 1 == n.channels_out ? 21 : 36 : n
						.sideinfo_len = 1 == n.channels_out ? 13 : 21, e.error_protection && (n.sideinfo_len += 2), h = (c = e).internal_flags,
						c.frameNum = 0, c.write_id3tag_automatic && A.id3tag_write_v2(c), h.bitrate_stereoMode_Hist = C([16, 5]), h.bitrate_blockType_Hist =
						C([16, 6]), h.PeakSample = 0, c.bWriteVbrTag && B.InitVbrTag(c), n.Class_ID = y, u = 0; u < 19; u++) n.nsPsy.pefirbuf[
						u] = 700 * n.mode_gr * n.channels_out;
					switch (-1 == e.ATHtype && (e.ATHtype = 4), e.VBR) {
						case ye.vbr_mt:
							e.VBR = ye.vbr_mtrh;
						case ye.vbr_mtrh:
							null == e.useTemporal && (e.useTemporal = !1), g.apply_preset(e, 500 - 10 * e.VBR_q, 0), e.quality < 0 && (e.quality =
									LAME_DEFAULT_QUALITY), e.quality < 5 && (e.quality = 0), 5 < e.quality && (e.quality = 5), n.PSY.mask_adjust =
								e.maskingadjust, n.PSY.mask_adjust_short = e.maskingadjust_short, e.experimentalY ? n.sfb21_extra = !1 : n.sfb21_extra =
								44e3 < e.out_samplerate, n.iteration_loop = new VBRNewIterationLoop(M);
							break;
						case ye.vbr_rh:
							g.apply_preset(e, 500 - 10 * e.VBR_q, 0), n.PSY.mask_adjust = e.maskingadjust, n.PSY.mask_adjust_short = e.maskingadjust_short,
								e.experimentalY ? n.sfb21_extra = !1 : n.sfb21_extra = 44e3 < e.out_samplerate, 6 < e.quality && (e.quality =
									6), e.quality < 0 && (e.quality = LAME_DEFAULT_QUALITY), n.iteration_loop = new VBROldIterationLoop(M);
							break;
						default:
							var d;
							n.sfb21_extra = !1, e.quality < 0 && (e.quality = LAME_DEFAULT_QUALITY), (d = e.VBR) == ye.vbr_off && (e.VBR_mean_bitrate_kbps =
									e.brate), g.apply_preset(e, e.VBR_mean_bitrate_kbps, 0), e.VBR = d, n.PSY.mask_adjust = e.maskingadjust, n.PSY
								.mask_adjust_short = e.maskingadjust_short, n.iteration_loop = d == ye.vbr_off ? new function(e) {
									var t = e;
									this.quantize = t, this.iteration_loop = function(e, t, a, s) {
										var n, r = e.internal_flags,
											i = Ae(z.SFBMAX),
											_ = Ae(576),
											o = Be(2),
											l = 0,
											f = r.l3_side,
											c = new F(l);
										this.quantize.rv.ResvFrameBegin(e, c), l = c.bits;
										for (var h = 0; h < r.mode_gr; h++) {
											n = this.quantize.qupvt.on_pe(e, t, o, l, h, h), r.mode_ext == Pe.MPG_MD_MS_LR && (this.quantize.ms_convert(
												r.l3_side, h), this.quantize.qupvt.reduce_side(o, a[h], l, n));
											for (var u = 0; u < r.channels_out; u++) {
												var m, b, p = f.tt[h][u];
												p.block_type != Pe.SHORT_TYPE ? (m = 0, b = r.PSY.mask_adjust - m) : (m = 0, b = r.PSY.mask_adjust_short -
													m), r.masking_lower = Math.pow(10, .1 * b), this.quantize.init_outer_loop(r, p), this.quantize.init_xrpow(
													r, p, _) && (this.quantize.qupvt.calc_xmin(e, s[h][u], p, i), this.quantize.outer_loop(e, p, i, _, u, o[
													u])), this.quantize.iteration_finish_one(r, h, u)
											}
										}
										this.quantize.rv.ResvFrameEnd(r, l)
									}
								}(M) : new ABRIterationLoop(M)
					}
					if (e.VBR != ye.vbr_off) {
						if (n.VBR_min_bitrate = 1, n.VBR_max_bitrate = 14, e.out_samplerate < 16e3 && (n.VBR_max_bitrate = 8), 0 != e.VBR_min_bitrate_kbps &&
							(e.VBR_min_bitrate_kbps = H(e.VBR_min_bitrate_kbps, e.version, e.out_samplerate), n.VBR_min_bitrate = I(e.VBR_min_bitrate_kbps,
								e.version, e.out_samplerate), n.VBR_min_bitrate < 0)) return -1;
						if (0 != e.VBR_max_bitrate_kbps && (e.VBR_max_bitrate_kbps = H(e.VBR_max_bitrate_kbps, e.version, e.out_samplerate),
								n.VBR_max_bitrate = I(e.VBR_max_bitrate_kbps, e.version, e.out_samplerate), n.VBR_max_bitrate < 0)) return -1;
						e.VBR_min_bitrate_kbps = j.bitrate_table[e.version][n.VBR_min_bitrate], e.VBR_max_bitrate_kbps = j.bitrate_table[
							e.version][n.VBR_max_bitrate], e.VBR_mean_bitrate_kbps = Math.min(j.bitrate_table[e.version][n.VBR_max_bitrate],
							e.VBR_mean_bitrate_kbps), e.VBR_mean_bitrate_kbps = Math.max(j.bitrate_table[e.version][n.VBR_min_bitrate], e.VBR_mean_bitrate_kbps)
					}
					return e.tune && (n.PSY.mask_adjust += e.tune_value_a, n.PSY.mask_adjust_short += e.tune_value_a),
						function(e) {
							var t = e.internal_flags;
							switch (e.quality) {
								default:
								case 9:
									t.psymodel = 0, t.noise_shaping = 0, t.noise_shaping_amp = 0, t.noise_shaping_stop = 0, t.use_best_huffman =
										0, t.full_outer_loop = 0;
									break;
								case 8:
									e.quality = 7;
								case 7:
									t.psymodel = 1, t.noise_shaping = 0, t.noise_shaping_amp = 0, t.noise_shaping_stop = 0, t.use_best_huffman =
										0, t.full_outer_loop = 0;
									break;
								case 6:
								case 5:
									t.psymodel = 1, 0 == t.noise_shaping && (t.noise_shaping = 1), t.noise_shaping_amp = 0, t.noise_shaping_stop =
										0, -1 == t.subblock_gain && (t.subblock_gain = 1), t.use_best_huffman = 0, t.full_outer_loop = 0;
									break;
								case 4:
									t.psymodel = 1, 0 == t.noise_shaping && (t.noise_shaping = 1), t.noise_shaping_amp = 0, t.noise_shaping_stop =
										0, -1 == t.subblock_gain && (t.subblock_gain = 1), t.use_best_huffman = 1, t.full_outer_loop = 0;
									break;
								case 3:
									t.psymodel = 1, 0 == t.noise_shaping && (t.noise_shaping = 1), t.noise_shaping_amp = 1, -(t.noise_shaping_stop =
										1) == t.subblock_gain && (t.subblock_gain = 1), t.use_best_huffman = 1, t.full_outer_loop = 0;
									break;
								case 2:
									t.psymodel = 1, 0 == t.noise_shaping && (t.noise_shaping = 1), 0 == t.substep_shaping && (t.substep_shaping =
											2), t.noise_shaping_amp = 1, -(t.noise_shaping_stop = 1) == t.subblock_gain && (t.subblock_gain = 1), t.use_best_huffman =
										1, t.full_outer_loop = 0;
									break;
								case 1:
								case 0:
									t.psymodel = 1, 0 == t.noise_shaping && (t.noise_shaping = 1), 0 == t.substep_shaping && (t.substep_shaping =
											2), t.noise_shaping_amp = 2, -(t.noise_shaping_stop = 1) == t.subblock_gain && (t.subblock_gain = 1), t.use_best_huffman =
										1, t.full_outer_loop = 0
							}
						}(e), e.athaa_type < 0 ? n.ATH.useAdjust = 3 : n.ATH.useAdjust = e.athaa_type, n.ATH.aaSensitivityP = Math.pow(
							10, e.athaa_sensitivity / -10), null == e.short_blocks && (e.short_blocks = ke.short_block_allowed), e.short_blocks !=
						ke.short_block_allowed || e.mode != Ee.JOINT_STEREO && e.mode != Ee.STEREO || (e.short_blocks = ke.short_block_coupled),
						e.quant_comp < 0 && (e.quant_comp = 1), e.quant_comp_short < 0 && (e.quant_comp_short = 0), e.msfix < 0 && (e.msfix =
							0), e.exp_nspsytune = 1 | e.exp_nspsytune, e.internal_flags.nsPsy.attackthre < 0 && (e.internal_flags.nsPsy.attackthre =
							G.NSATTACKTHRE), e.internal_flags.nsPsy.attackthre_s < 0 && (e.internal_flags.nsPsy.attackthre_s = G.NSATTACKTHRE_S),
						e.scale < 0 && (e.scale = 1), e.ATHtype < 0 && (e.ATHtype = 4), e.ATHcurve < 0 && (e.ATHcurve = 4), e.athaa_loudapprox <
						0 && (e.athaa_loudapprox = 2), e.interChRatio < 0 && (e.interChRatio = 0), null == e.useTemporal && (e.useTemporal = !
							0), n.slot_lag = n.frac_SpF = 0, e.VBR == ye.vbr_off && (n.slot_lag = n.frac_SpF = 72e3 * (e.version + 1) * e.brate %
							e.out_samplerate | 0), S.iteration_init(e), x.psymodel_init(e), 0
				}, this.lame_encode_flush = function(e, t, a, s) {
					var n, r, i, _, o = e.internal_flags,
						l = b([2, 1152]),
						f = 0,
						c = o.mf_samples_to_encode - Pe.POSTDELAY,
						h = V(e);
					if (o.mf_samples_to_encode < 1) return 0;
					for (n = 0, e.in_samplerate != e.out_samplerate && (c += 16 * e.out_samplerate / e.in_samplerate), (i = e.framesize -
							c % e.framesize) < 576 && (i += e.framesize), _ = (c + (e.encoder_padding = i)) / e.framesize; 0 < _ && 0 <= f;) {
						var u = h - o.mf_size,
							m = e.frameNum;
						u *= e.in_samplerate, 1152 < (u /= e.out_samplerate) && (u = 1152), u < 1 && (u = 1), r = s - n, 0 == s && (r =
							0), a += f = this.lame_encode_buffer(e, l[0], l[1], u, t, a, r), n += f, _ -= m != e.frameNum ? 1 : 0
					}
					if (f < (o.mf_samples_to_encode = 0)) return f;
					if (r = s - n, 0 == s && (r = 0), w.flush_bitstream(e), (f = w.copy_buffer(o, t, a, r, 1)) < 0) return f;
					if (a += f, r = s - (n += f), 0 == s && (r = 0), e.write_id3tag_automatic) {
						if (A.id3tag_write_v1(e), (f = w.copy_buffer(o, t, a, r, 0)) < 0) return f;
						n += f
					}
					return n
				}, this.lame_encode_buffer = function(e, t, a, s, n, r, i) {
					var _, o, l = e.internal_flags,
						f = [null, null];
					if (l.Class_ID != y) return -3;
					if (0 == s) return 0;
					o = s, (null == (_ = l).in_buffer_0 || _.in_buffer_nsamples < o) && (_.in_buffer_0 = Ae(o), _.in_buffer_1 = Ae(o),
						_.in_buffer_nsamples = o), f[0] = l.in_buffer_0, f[1] = l.in_buffer_1;
					for (var c = 0; c < s; c++) f[0][c] = t[c], 1 < l.channels_in && (f[1][c] = a[c]);
					return function(e, t, a, s, n, r, i) {
						var _, o, l, f, c, h = e.internal_flags,
							u = 0,
							m = [null, null],
							b = [null, null];
						if (h.Class_ID != y) return -3;
						if (0 == s) return 0;
						if ((c = w.copy_buffer(h, n, r, i, 0)) < 0) return c;
						if (r += c, u += c, b[0] = t, b[1] = a, q.NEQ(e.scale, 0) && q.NEQ(e.scale, 1))
							for (o = 0; o < s; ++o) b[0][o] *= e.scale, 2 == h.channels_out && (b[1][o] *= e.scale);
						if (q.NEQ(e.scale_left, 0) && q.NEQ(e.scale_left, 1))
							for (o = 0; o < s; ++o) b[0][o] *= e.scale_left;
						if (q.NEQ(e.scale_right, 0) && q.NEQ(e.scale_right, 1))
							for (o = 0; o < s; ++o) b[1][o] *= e.scale_right;
						if (2 == e.num_channels && 1 == h.channels_out)
							for (o = 0; o < s; ++o) b[0][o] = .5 * (b[0][o] + b[1][o]), b[1][o] = 0;
						f = V(e), m[0] = h.mfbuf[0], m[1] = h.mfbuf[1];
						var p = 0;
						for (; 0 < s;) {
							var v = [null, null],
								d = 0,
								g = 0;
							v[0] = b[0], v[1] = b[1];
							var S = new N;
							if (Y(e, m, v, p, s, S), d = S.n_in, g = S.n_out, h.findReplayGain && !h.decode_on_the_fly && R.AnalyzeSamples(
									h.rgdata, m[0], h.mf_size, m[1], h.mf_size, g, h.channels_out) == X.GAIN_ANALYSIS_ERROR) return -6;
							if (s -= d, p += d, h.channels_out, h.mf_size += g, h.mf_samples_to_encode < 1 && (h.mf_samples_to_encode = Pe
									.ENCDELAY + Pe.POSTDELAY), h.mf_samples_to_encode += g, h.mf_size >= f) {
								var M = i - u;
								if (0 == i && (M = 0), (_ = O(e, m[0], m[1], n, r, M)) < 0) return _;
								for (r += _, u += _, h.mf_size -= e.framesize, h.mf_samples_to_encode -= e.framesize, l = 0; l < h.channels_out; l++)
									for (o = 0; o < h.mf_size; o++) m[l][o] = m[l][o + e.framesize]
							}
						}
						return u
					}(e, f[0], f[1], s, n, r, i)
				}
			}
			z.SFBMAX = 3 * Pe.SBMAX_s, Pe.ENCDELAY = 576, Pe.POSTDELAY = 1152, Pe.FFTOFFSET = 224 + (Pe.MDCTDELAY = 48), Pe.DECDELAY =
				528, Pe.SBLIMIT = 32, Pe.CBANDS = 64, Pe.SBPSY_l = 21, Pe.SBPSY_s = 12, Pe.SBMAX_l = 22, Pe.SBMAX_s = 13, Pe.PSFB21 =
				6, Pe.PSFB12 = 6, Pe.HBLKSIZE = (Pe.BLKSIZE = 1024) / 2 + 1, Pe.HBLKSIZE_s = (Pe.BLKSIZE_s = 256) / 2 + 1, Pe.NORM_TYPE =
				0, Pe.START_TYPE = 1, Pe.SHORT_TYPE = 2, Pe.STOP_TYPE = 3, Pe.MPG_MD_LR_LR = 0, Pe.MPG_MD_LR_I = 1, Pe.MPG_MD_MS_LR =
				2, Pe.MPG_MD_MS_I = 3, Pe.fircoef = [-.1039435, -.1892065, 5 * -.0432472, -.155915, 3.898045e-17, .0467745 * 5,
					.50455, .756825, .187098 * 5
				], Z.MFSIZE = 3456 + Pe.ENCDELAY - Pe.MDCTDELAY, Z.MAX_HEADER_BUF = 256, Z.MAX_BITS_PER_CHANNEL = 4095, Z.MAX_BITS_PER_GRANULE =
				7680, Z.BPC = 320, z.SFBMAX = 3 * Pe.SBMAX_s, t.Mp3Encoder = function(s, e, t) {
					3 != arguments.length && (console.error("WARN: Mp3Encoder(channels, samplerate, kbps) not specified"), s = 1, e =
						44100, t = 128);
					var n = new U,
						a = new function() {
							this.setModules = function(e, t) {}
						},
						r = new X,
						i = new q,
						_ = new function() {
							function e(e, t, a, s, n, r, i, _, o, l, f, c, h, u, m) {
								this.vbr_q = e, this.quant_comp = t, this.quant_comp_s = a, this.expY = s, this.st_lrm = n, this.st_s = r, this
									.masking_adj = i, this.masking_adj_short = _, this.ath_lower = o, this.ath_curve = l, this.ath_sensitivity = f,
									this.interch = c, this.safejoint = h, this.sfb21mod = u, this.msfix = m
							}

							function t(e, t, a, s, n, r, i, _, o, l, f, c, h, u) {
								this.quant_comp = t, this.quant_comp_s = a, this.safejoint = s, this.nsmsfix = n, this.st_lrm = r, this.st_s =
									i, this.nsbass = _, this.scale = o, this.masking_adj = l, this.ath_lower = f, this.ath_curve = c, this.interch =
									h, this.sfscale = u
							}
							var i;
							this.setModules = function(e) {
								i = e
							};
							var f = [new e(0, 9, 9, 0, 5.2, 125, -4.2, -6.3, 4.8, 1, 0, 0, 2, 21, .97), new e(1, 9, 9, 0, 5.3, 125, -3.6, -
									5.6, 4.5, 1.5, 0, 0, 2, 21, 1.35), new e(2, 9, 9, 0, 5.6, 125, -2.2, -3.5, 2.8, 2, 0, 0, 2, 21, 1.49), new e(
									3, 9, 9, 1, 5.8, 130, -1.8, -2.8, 2.6, 3, -4, 0, 2, 20, 1.64), new e(4, 9, 9, 1, 6, 135, -.7, -1.1, 1.1, 3.5,
									-8, 0, 2, 0, 1.79), new e(5, 9, 9, 1, 6.4, 140, .5, .4, -7.5, 4, -12, 2e-4, 0, 0, 1.95), new e(6, 9, 9, 1,
									6.6, 145, .67, .65, -14.7, 6.5, -19, 4e-4, 0, 0, 2.3), new e(7, 9, 9, 1, 6.6, 145, .8, .75, -19.7, 8, -22,
									6e-4, 0, 0, 2.7), new e(8, 9, 9, 1, 6.6, 145, 1.2, 1.15, -27.5, 10, -23, 7e-4, 0, 0, 0), new e(9, 9, 9, 1,
									6.6, 145, 1.6, 1.6, -36, 11, -25, 8e-4, 0, 0, 0), new e(10, 9, 9, 1, 6.6, 145, 2, 2, -36, 12, -25, 8e-4, 0, 0,
									0)],
								c = [new e(0, 9, 9, 0, 4.2, 25, -7, -4, 7.5, 1, 0, 0, 2, 26, .97), new e(1, 9, 9, 0, 4.2, 25, -5.6, -3.6, 4.5,
									1.5, 0, 0, 2, 21, 1.35), new e(2, 9, 9, 0, 4.2, 25, -4.4, -1.8, 2, 2, 0, 0, 2, 18, 1.49), new e(3, 9, 9, 1,
									4.2, 25, -3.4, -1.25, 1.1, 3, -4, 0, 2, 15, 1.64), new e(4, 9, 9, 1, 4.2, 25, -2.2, .1, 0, 3.5, -8, 0, 2, 0,
									1.79), new e(5, 9, 9, 1, 4.2, 25, -1, 1.65, -7.7, 4, -12, 2e-4, 0, 0, 1.95), new e(6, 9, 9, 1, 4.2, 25, -0,
									2.47, -7.7, 6.5, -19, 4e-4, 0, 0, 2), new e(7, 9, 9, 1, 4.2, 25, .5, 2, -14.5, 8, -22, 6e-4, 0, 0, 2), new e(
									8, 9, 9, 1, 4.2, 25, 1, 2.4, -22, 10, -23, 7e-4, 0, 0, 2), new e(9, 9, 9, 1, 4.2, 25, 1.5, 2.95, -30, 11, -25,
									8e-4, 0, 0, 2), new e(10, 9, 9, 1, 4.2, 25, 2, 2.95, -36, 12, -30, 8e-4, 0, 0, 2)];

							function s(e, t, a) {
								var s, n, r = e.VBR == ye.vbr_rh ? f : c,
									i = e.VBR_q_frac,
									_ = r[t],
									o = r[t + 1],
									l = _;
								_.st_lrm = _.st_lrm + i * (o.st_lrm - _.st_lrm), _.st_s = _.st_s + i * (o.st_s - _.st_s), _.masking_adj = _.masking_adj +
									i * (o.masking_adj - _.masking_adj), _.masking_adj_short = _.masking_adj_short + i * (o.masking_adj_short - _.masking_adj_short),
									_.ath_lower = _.ath_lower + i * (o.ath_lower - _.ath_lower), _.ath_curve = _.ath_curve + i * (o.ath_curve - _.ath_curve),
									_.ath_sensitivity = _.ath_sensitivity + i * (o.ath_sensitivity - _.ath_sensitivity), _.interch = _.interch + i *
									(o.interch - _.interch), _.msfix = _.msfix + i * (o.msfix - _.msfix), s = e, (n = l.vbr_q) < 0 && (n = 0), 9 <
									n && (n = 9), s.VBR_q = n, (s.VBR_q_frac = 0) != a ? e.quant_comp = l.quant_comp : 0 < Math.abs(e.quant_comp -
										-1) || (e.quant_comp = l.quant_comp), 0 != a ? e.quant_comp_short = l.quant_comp_s : 0 < Math.abs(e.quant_comp_short -
										-1) || (e.quant_comp_short = l.quant_comp_s), 0 != l.expY && (e.experimentalY = 0 != l.expY), 0 != a ? e.internal_flags
									.nsPsy.attackthre = l.st_lrm : 0 < Math.abs(e.internal_flags.nsPsy.attackthre - -1) || (e.internal_flags.nsPsy
										.attackthre = l.st_lrm), 0 != a ? e.internal_flags.nsPsy.attackthre_s = l.st_s : 0 < Math.abs(e.internal_flags
										.nsPsy.attackthre_s - -1) || (e.internal_flags.nsPsy.attackthre_s = l.st_s), 0 != a ? e.maskingadjust = l.masking_adj :
									0 < Math.abs(e.maskingadjust - 0) || (e.maskingadjust = l.masking_adj), 0 != a ? e.maskingadjust_short = l.masking_adj_short :
									0 < Math.abs(e.maskingadjust_short - 0) || (e.maskingadjust_short = l.masking_adj_short), 0 != a ? e.ATHlower = -
									l.ath_lower / 10 : 0 < Math.abs(10 * -e.ATHlower - 0) || (e.ATHlower = -l.ath_lower / 10), 0 != a ? e.ATHcurve =
									l.ath_curve : 0 < Math.abs(e.ATHcurve - -1) || (e.ATHcurve = l.ath_curve), 0 != a ? e.athaa_sensitivity = l.ath_sensitivity :
									0 < Math.abs(e.athaa_sensitivity - -1) || (e.athaa_sensitivity = l.ath_sensitivity), 0 < l.interch && (0 != a ?
										e.interChRatio = l.interch : 0 < Math.abs(e.interChRatio - -1) || (e.interChRatio = l.interch)), 0 < l.safejoint &&
									(e.exp_nspsytune = e.exp_nspsytune | l.safejoint), 0 < l.sfb21mod && (e.exp_nspsytune = e.exp_nspsytune | l.sfb21mod <<
										20), 0 != a ? e.msfix = l.msfix : 0 < Math.abs(e.msfix - -1) || (e.msfix = l.msfix), 0 == a && (e.VBR_q = t,
										e.VBR_q_frac = i)
							}
							var _ = [new t(8, 9, 9, 0, 0, 6.6, 145, 0, .95, 0, -30, 11, .0012, 1), new t(16, 9, 9, 0, 0, 6.6, 145, 0, .95, 0,
									-25, 11, .001, 1), new t(24, 9, 9, 0, 0, 6.6, 145, 0, .95, 0, -20, 11, .001, 1), new t(32, 9, 9, 0, 0, 6.6,
									145, 0, .95, 0, -15, 11, .001, 1), new t(40, 9, 9, 0, 0, 6.6, 145, 0, .95, 0, -10, 11, 9e-4, 1), new t(48, 9,
									9, 0, 0, 6.6, 145, 0, .95, 0, -10, 11, 9e-4, 1), new t(56, 9, 9, 0, 0, 6.6, 145, 0, .95, 0, -6, 11, 8e-4, 1),
								new t(64, 9, 9, 0, 0, 6.6, 145, 0, .95, 0, -2, 11, 8e-4, 1), new t(80, 9, 9, 0, 0, 6.6, 145, 0, .95, 0, 0, 8,
									7e-4, 1), new t(96, 9, 9, 0, 2.5, 6.6, 145, 0, .95, 0, 1, 5.5, 6e-4, 1), new t(112, 9, 9, 0, 2.25, 6.6, 145,
									0, .95, 0, 2, 4.5, 5e-4, 1), new t(128, 9, 9, 0, 1.95, 6.4, 140, 0, .95, 0, 3, 4, 2e-4, 1), new t(160, 9, 9,
									1, 1.79, 6, 135, 0, .95, -2, 5, 3.5, 0, 1), new t(192, 9, 9, 1, 1.49, 5.6, 125, 0, .97, -4, 7, 3, 0, 0), new t(
									224, 9, 9, 1, 1.25, 5.2, 125, 0, .98, -6, 9, 2, 0, 0), new t(256, 9, 9, 1, .97, 5.2, 125, 0, 1, -8, 10, 1, 0,
									0), new t(320, 9, 9, 1, .9, 5.2, 125, 0, 1, -10, 12, 0, 0, 0)
							];

							function n(e, t, a) {
								var s = t,
									n = i.nearestBitrateFullIndex(t);
								if (e.VBR = ye.vbr_abr, e.VBR_mean_bitrate_kbps = s, e.VBR_mean_bitrate_kbps = Math.min(e.VBR_mean_bitrate_kbps,
										320), e.VBR_mean_bitrate_kbps = Math.max(e.VBR_mean_bitrate_kbps, 8), e.brate = e.VBR_mean_bitrate_kbps, 320 <
									e.VBR_mean_bitrate_kbps && (e.disable_reservoir = !0), 0 < _[n].safejoint && (e.exp_nspsytune = 2 | e.exp_nspsytune),
									0 < _[n].sfscale && (e.internal_flags.noise_shaping = 2), 0 < Math.abs(_[n].nsbass)) {
									var r = int(4 * _[n].nsbass);
									r < 0 && (r += 64), e.exp_nspsytune = e.exp_nspsytune | r << 2
								}
								return 0 != a ? e.quant_comp = _[n].quant_comp : 0 < Math.abs(e.quant_comp - -1) || (e.quant_comp = _[n].quant_comp),
									0 != a ? e.quant_comp_short = _[n].quant_comp_s : 0 < Math.abs(e.quant_comp_short - -1) || (e.quant_comp_short =
										_[n].quant_comp_s), 0 != a ? e.msfix = _[n].nsmsfix : 0 < Math.abs(e.msfix - -1) || (e.msfix = _[n].nsmsfix),
									0 != a ? e.internal_flags.nsPsy.attackthre = _[n].st_lrm : 0 < Math.abs(e.internal_flags.nsPsy.attackthre - -1) ||
									(e.internal_flags.nsPsy.attackthre = _[n].st_lrm), 0 != a ? e.internal_flags.nsPsy.attackthre_s = _[n].st_s :
									0 < Math.abs(e.internal_flags.nsPsy.attackthre_s - -1) || (e.internal_flags.nsPsy.attackthre_s = _[n].st_s), 0 !=
									a ? e.scale = _[n].scale : 0 < Math.abs(e.scale - -1) || (e.scale = _[n].scale), 0 != a ? e.maskingadjust = _[
										n].masking_adj : 0 < Math.abs(e.maskingadjust - 0) || (e.maskingadjust = _[n].masking_adj), 0 < _[n].masking_adj ?
									0 != a ? e.maskingadjust_short = .9 * _[n].masking_adj : 0 < Math.abs(e.maskingadjust_short - 0) || (e.maskingadjust_short =
										.9 * _[n].masking_adj) : 0 != a ? e.maskingadjust_short = 1.1 * _[n].masking_adj : 0 < Math.abs(e.maskingadjust_short -
										0) || (e.maskingadjust_short = 1.1 * _[n].masking_adj), 0 != a ? e.ATHlower = -_[n].ath_lower / 10 : 0 < Math
									.abs(10 * -e.ATHlower - 0) || (e.ATHlower = -_[n].ath_lower / 10), 0 != a ? e.ATHcurve = _[n].ath_curve : 0 <
									Math.abs(e.ATHcurve - -1) || (e.ATHcurve = _[n].ath_curve), 0 != a ? e.interChRatio = _[n].interch : 0 < Math.abs(
										e.interChRatio - -1) || (e.interChRatio = _[n].interch), t
							}
							this.apply_preset = function(e, t, a) {
								switch (t) {
									case U.R3MIX:
										t = U.V3, e.VBR = ye.vbr_mtrh;
										break;
									case U.MEDIUM:
										t = U.V4, e.VBR = ye.vbr_rh;
										break;
									case U.MEDIUM_FAST:
										t = U.V4, e.VBR = ye.vbr_mtrh;
										break;
									case U.STANDARD:
										t = U.V2, e.VBR = ye.vbr_rh;
										break;
									case U.STANDARD_FAST:
										t = U.V2, e.VBR = ye.vbr_mtrh;
										break;
									case U.EXTREME:
										t = U.V0, e.VBR = ye.vbr_rh;
										break;
									case U.EXTREME_FAST:
										t = U.V0, e.VBR = ye.vbr_mtrh;
										break;
									case U.INSANE:
										return t = 320, e.preset = t, n(e, t, a), e.VBR = ye.vbr_off, t
								}
								switch (e.preset = t) {
									case U.V9:
										return s(e, 9, a), t;
									case U.V8:
										return s(e, 8, a), t;
									case U.V7:
										return s(e, 7, a), t;
									case U.V6:
										return s(e, 6, a), t;
									case U.V5:
										return s(e, 5, a), t;
									case U.V4:
										return s(e, 4, a), t;
									case U.V3:
										return s(e, 3, a), t;
									case U.V2:
										return s(e, 2, a), t;
									case U.V1:
										return s(e, 1, a), t;
									case U.V0:
										return s(e, 0, a), t
								}
								return 8 <= t && t <= 320 ? n(e, t, a) : (e.preset = 0, t)
							}
						},
						o = new y,
						l = new R,
						f = new M,
						c = new function() {
							this.getLameVersion = function() {
								return "3.98.4"
							}, this.getLameShortVersion = function() {
								return "3.98.4"
							}, this.getLameVeryShortVersion = function() {
								return "LAME3.98r"
							}, this.getPsyVersion = function() {
								return "0.93"
							}, this.getLameUrl = function() {
								return "http://www.mp3dev.org/"
							}, this.getLameOsBitness = function() {
								return "32bits"
							}
						},
						h = new function() {
							this.setModules = function(e, t) {}
						},
						u = new function() {
							var o;
							this.setModules = function(e) {
								o = e
							}, this.ResvFrameBegin = function(e, t) {
								var a, s = e.internal_flags,
									n = s.l3_side,
									r = o.getframebits(e);
								t.bits = (r - 8 * s.sideinfo_len) / s.mode_gr;
								var i = 2048 * s.mode_gr - 8;
								320 < e.brate ? a = 8 * int(1e3 * e.brate / (e.out_samplerate / 1152) / 8 + .5) : (a = 11520, e.strict_ISO &&
									(a = 8 * int(32e4 / (e.out_samplerate / 1152) / 8 + .5))), s.ResvMax = a - r, s.ResvMax > i && (s.ResvMax =
									i), (s.ResvMax < 0 || e.disable_reservoir) && (s.ResvMax = 0);
								var _ = t.bits * s.mode_gr + Math.min(s.ResvSize, s.ResvMax);
								return a < _ && (_ = a), n.resvDrain_pre = 0, null != s.pinfo && (s.pinfo.mean_bits = t.bits / 2, s.pinfo.resvsize =
									s.ResvSize), _
							}, this.ResvMaxBits = function(e, t, a, s) {
								var n, r = e.internal_flags,
									i = r.ResvSize,
									_ = r.ResvMax;
								0 != s && (i += t), 0 != (1 & r.substep_shaping) && (_ *= .9), a.bits = t, 9 * _ < 10 * i ? (n = i - 9 * _ /
									10, a.bits += n, r.substep_shaping |= 128) : (n = 0, r.substep_shaping &= 127, e.disable_reservoir || 0 != (
									1 & r.substep_shaping) || (a.bits -= .1 * t));
								var o = i < 6 * r.ResvMax / 10 ? i : 6 * r.ResvMax / 10;
								return (o -= n) < 0 && (o = 0), o
							}, this.ResvAdjust = function(e, t) {
								e.ResvSize -= t.part2_3_length + t.part2_length
							}, this.ResvFrameEnd = function(e, t) {
								var a, s = e.l3_side;
								e.ResvSize += t * e.mode_gr;
								var n = 0;
								s.resvDrain_post = 0, (s.resvDrain_pre = 0) != (a = e.ResvSize % 8) && (n += a), 0 < (a = e.ResvSize - n - e.ResvMax) &&
									(n += a);
								var r = Math.min(8 * s.main_data_begin, n) / 8;
								s.resvDrain_pre += 8 * r, n -= 8 * r, e.ResvSize -= 8 * r, s.main_data_begin -= r, s.resvDrain_post += n, e.ResvSize -=
									n
							}
						},
						m = new T,
						b = new function() {
							this.setModules = function(e, t, a) {}
						},
						p = new function() {};
					n.setModules(r, i, _, o, l, f, c, h, p), i.setModules(r, p, c, f), h.setModules(i, c), _.setModules(n), l.setModules(
						i, u, o, m), o.setModules(m, u, n.enc.psy), u.setModules(i), m.setModules(o), f.setModules(n, i, c), a.setModules(
						b, p), b.setModules(c, h, _);
					var v = n.lame_init();
					v.num_channels = s, v.in_samplerate = e, v.out_samplerate = e, v.brate = t, v.mode = Ee.STEREO, v.quality = 3, v.bWriteVbrTag = !
						1, v.disable_reservoir = !0, v.write_id3tag_automatic = !1, n.lame_init_params(v);
					var d = 1152,
						g = 0 | 1.25 * d + 7200,
						S = B(g);
					this.encodeBuffer = function(e, t) {
						1 == s && (t = e), e.length > d && (d = e.length, S = B(g = 0 | 1.25 * d + 7200));
						var a = n.lame_encode_buffer(v, e, t, e.length, S, 0, g);
						return new Int8Array(S.subarray(0, a))
					}, this.flush = function() {
						var e = n.lame_encode_flush(v, S, 0, g);
						return new Int8Array(S.subarray(0, e))
					}
				}
		}
		t(), Recorder.lamejs = t
	}();
