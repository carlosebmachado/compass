import React, { useState, useEffect, useRef } from "react";

import { GLView, ExpoWebGLRenderingContext } from "expo-gl";
import Expo2DContext, { Expo2dContextOptions } from "expo-2d-context";
import { ReduceMotion, useSharedValue, withSpring } from "react-native-reanimated";

import MathUtils from "@/util/MathUtils";
import CompassUtils from "@/util/CompassUtils";

interface CompassProps {
  heading: number;
}

export default function Compass({ heading }: CompassProps) {
  const [glContext, setGLContext] = useState<ExpoWebGLRenderingContext | null>(null);
  const currentHeading = useSharedValue(heading);

  function percentWidth(ctx: Expo2DContext, percent: number) {
    return (percent / 100) * ctx!.width;
  }

  function percentHeight(ctx: Expo2DContext, percent: number) {
    return (percent / 100) * ctx.height;
  }

  function normalizedNorth(degree: number) {
    return MathUtils.degreesToRadians(270 + degree);
  }

  function map360To180(degree: number) {
    const normalizedValue = ((degree % 360) + 360) % 360; // Garante que o valor esteja no intervalo [0, 360)
    return normalizedValue <= 180 ? normalizedValue : 360 - normalizedValue;
  }

  async function onGLContextCreate(gl: ExpoWebGLRenderingContext) {
    setGLContext(gl);
  }

  useEffect(() => {
    if (glContext) {
      currentHeading.value = withSpring(heading, {
        mass: 10,
        damping: 100,
        stiffness: 75,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        reduceMotion: ReduceMotion.System,
      });

      const ctx = new Expo2DContext(glContext, {} as Expo2dContextOptions);

      // settings
      ctx.translate(ctx.width / 2, ctx.height / 2);
      ctx.initializeText().then(() => {
        ctx.rotate(MathUtils.degreesToRadians(currentHeading.value)); // radians angle
        ctx.save();

        // segments
        const numSegments = 360; // 2 degree segments
        const segmentAngle = (2 * Math.PI) / numSegments;
        // segment settings
        const segmentX = percentHeight(ctx, 35);
        // default segment
        const defSegY = -percentHeight(ctx, 0.27);
        const defSegWidth = percentHeight(ctx, 4.25);
        const defSegHeight = percentHeight(ctx, 0.54);
        // step segment
        const stepSegY = -percentHeight(ctx, 0.46);
        const stepSegWidth = percentHeight(ctx, 5.02);
        const stepSegHeight = percentHeight(ctx, 0.93);
        // degree text
        const degTextX = percentHeight(ctx, 46);
        const degTextSize = percentHeight(ctx, 5.56);
        const yDegTextAdjustPerc = percentHeight(ctx, 0.02);
        // degree text
        const cardTextX = percentHeight(ctx, 30);
        const cardTextSize = percentHeight(ctx, 12);
        const yCardTextAdjustPerc = percentHeight(ctx, 0.06);

        // draw segments
        for (let i = 0; i < numSegments; i++) {
          if (i % 2 !== 0) continue;

          ctx.save();
          ctx.rotate(i * segmentAngle);

          if (i === 0 || i === 90 || i === 180 || i === 270) {
            var textWidth = i.toString().length * cardTextSize;
            ctx.save();
            ctx.fillStyle = "dark gray";
            ctx.font = cardTextSize.toFixed(0) + "px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.rotate(MathUtils.degreesToRadians(-90));
            ctx.translate(cardTextX, 0);
            ctx.rotate(-(i * segmentAngle + MathUtils.degreesToRadians(currentHeading.value)) + Math.PI / 2);
            ctx.fillText(`${CompassUtils.getCardinalDirection(i)}`, 0, -(map360To180(i) * yCardTextAdjustPerc), textWidth);
            ctx.restore();
          }

          // rectangle
          if (i % 15 === 0) {
            var textWidth = i.toString().length * degTextSize;
            ctx.save();
            ctx.fillStyle = "dark gray";
            ctx.font = degTextSize.toFixed(0) + "px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.rotate(MathUtils.degreesToRadians(-90));
            ctx.translate(degTextX, 0);
            ctx.rotate(-(i * segmentAngle + MathUtils.degreesToRadians(currentHeading.value)) + Math.PI / 2);
            ctx.fillText(`${i}`, 0, -(map360To180(i) * yDegTextAdjustPerc), textWidth);
            ctx.restore();

            ctx.fillStyle = "dark gray";
            ctx.fillRect(segmentX, stepSegY, stepSegWidth, stepSegHeight);
          } else {
            ctx.fillStyle = "gray";
            ctx.fillRect(segmentX, defSegY, defSegWidth, defSegHeight);
          }

          ctx.restore();
        }

        ctx.restore();

        ctx.flush();
      });
    }
  }, [heading, glContext]);

  return <GLView style={{ flex: 1, width: "100%", height: "100%" }} onContextCreate={onGLContextCreate} />;
}
