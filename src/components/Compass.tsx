import React, { useEffect } from "react";

import { GLView, ExpoWebGLRenderingContext } from "expo-gl";
import Expo2DContext, { Expo2dContextOptions } from "expo-2d-context";

export default function Compass() {
  var ctx : Expo2DContext | null = null;

  function drawExample(ctx: Expo2DContext) {
    ctx.translate(50, 200);
    ctx.scale(4, 4);
    ctx.fillStyle = "grey";
    ctx.fillRect(20, 40, 100, 100);
    ctx.fillStyle = "white";
    ctx.fillRect(30, 100, 20, 30);
    ctx.fillRect(60, 100, 20, 30);
    ctx.fillRect(90, 100, 20, 30);
    ctx.beginPath();
    ctx.arc(50, 70, 18, 0, 2 * Math.PI);
    ctx.arc(90, 70, 18, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(50, 70, 8, 0, 2 * Math.PI);
    ctx.arc(90, 70, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(70, 40);
    ctx.lineTo(70, 30);
    ctx.arc(70, 20, 10, 0.5 * Math.PI, 2.5 * Math.PI);
    ctx.stroke();
    ctx.flush();
  }

  function onGLContextCreate(gl: ExpoWebGLRenderingContext) {
    ctx = new Expo2DContext(gl, {renderWithOffscreenBuffer: true} as Expo2dContextOptions);
    // drawExample(ctx);

    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(300, 400, 36, 0, 2 * Math.PI);
    ctx.fill();

    ctx.flush();
    
    gl.endFrameEXP();
  }

  useEffect(() => {
    
  }, []);

  return <GLView style={{ flex: 1, width: "100%", height: "100%" }} onContextCreate={onGLContextCreate} />;
}
