import fs from 'fs';

// 1. Update public/rpg/game.js for seamless delivery quest pickup, waypoint routing, and completion
const gameJsPath = 'C:\\Users\\lekho\\OneDrive\\Documents\\SE183675\\HCM202\\public\\rpg\\game.js';
let code = fs.readFileSync(gameJsPath, 'utf8');

// A. Fix Delivery Quest Execution in executePlayerAction
const oldDeliveryRegex = /\/\/ A\. IF CURRENTLY ENGAGED IN A MULTI-STEP DOSSIER QUEST:[\s\S]*?\/\/ B\. IF NEAR A BUILDING:/;

const newDelivery = `// A. IF CURRENTLY ENGAGED IN A MULTI-STEP DOSSIER QUEST:
  if (state.activeQuest) {
    const quest = state.activeQuest;
    const currentStep = quest.steps[quest.currentStepIndex];
    const currentBuildings = getCurrentPhaseBuildings();
    const matchingTargets = currentBuildings.filter(b => b.id === currentStep.bldgId || b.type === currentStep.bldgId || b.id.includes(currentStep.bldgId));
    const targetBldg = matchingTargets[0] || getBuildingById(currentStep.bldgId);

    let isAtTarget = false;
    let reachedBldg = null;
    for (const b of (matchingTargets.length > 0 ? matchingTargets : [targetBldg])) {
      if (!b) continue;
      const stX = b.stationX !== undefined ? b.stationX : b.x;
      const stY = b.stationY !== undefined ? b.stationY : b.y;
      const distStation = Math.hypot(state.player.x - stX, state.player.y - stY);
      const distBox = distanceToBuilding(state.player.x, state.player.y, b);
      if (distStation <= 160 || distBox <= 120 || (state.nearbyBuilding && (state.nearbyBuilding.id === b.id || state.nearbyBuilding.type === b.type))) {
        isAtTarget = true;
        reachedBldg = b;
        break;
      }
    }

    if (isAtTarget) {
      const isFinalStep = quest.currentStepIndex >= quest.totalSteps - 1;

      if (!isFinalStep) {
        quest.currentStepIndex += 1;
        const nextStep = quest.steps[quest.currentStepIndex];
        const nextBldg = getBuildingById(nextStep.bldgId) || currentBuildings.find(b => b.id === nextStep.bldgId);

        sfx.stepComplete();
        spawnParticles(state.player.x, state.player.y, quest.color || "#38bdf8", 20, 95, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          \`✓ Xong bước \${quest.currentStepIndex}/\${quest.totalSteps}! Tiếp tục đến \${nextBldg ? nextBldg.name : "Điểm tiếp theo"}!\`,
          "#38bdf8"
        );
      } else {
        sfx.stamp();
        spawnParticles(state.player.x, state.player.y, "#f59e0b", 35, 140, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          \`★ HOÀN THÀNH: \${quest.title}! (+5 Điểm)\`,
          "#4ade80"
        );

        postToParent({
          type: "POLICY_ITEM_COLLECT",
          itemId: quest.entityId,
          itemType: "delivery_quest",
          scoreDelta: 5,
          message: \`★ Hoàn thành vận chuyển: \${quest.title}! (+5đ)\`,
        });
        state.activeQuest = null;
      }
      return;
    } else {
      spawnFloatingText(
        state.player.x,
        state.player.y,
        \`Đích đến: \${targetBldg ? targetBldg.name : "Nơi nhận hàng"}! (Theo dõi mũi tên vàng)\`,
        "#fbbf24"
      );
      return;
    }
  }

  // B. IF NEAR A BUILDING:`;

code = code.replace(oldDeliveryRegex, newDelivery);

// B. Fix Waypoint Compass Arrow when carrying a quest
const oldWaypointBlockRegex = /\/\/ Waypoint Guidance Arrow to Target Policy Station or Building[\s\S]*?ctx\.restore\(\);\s+\}/;

const newWaypointBlock = `// Waypoint Guidance Arrow to Target Policy Station or Active Delivery Destination
  if (isLocal) {
    let targetX = null;
    let targetY = null;
    let targetLabel = "MỤC TIÊU";

    if (state.activeQuest) {
      const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
      const currentBuildings = getCurrentPhaseBuildings();
      const targetBldg = currentBuildings.find(b => b.id === currentStep.bldgId || b.type === currentStep.bldgId) || getBuildingById(currentStep.bldgId);
      if (targetBldg) {
        targetX = targetBldg.stationX !== undefined ? targetBldg.stationX : targetBldg.x;
        targetY = targetBldg.stationY !== undefined ? targetBldg.stationY : targetBldg.y;
        targetLabel = \`GIAO ĐẾN: \${targetBldg.name || "NƠI TIẾP NHẬN"}\`;
      }
    } else if (state.policyStation && !state.taskCompletedByPlayer) {
      targetX = toWorldX(state.policyStation.x);
      targetY = toWorldY(state.policyStation.y);
      targetLabel = "TRẠM KHẢO SÁT";
    }

    if (targetX !== null && targetY !== null) {
      const angle = Math.atan2(targetY - y, targetX - x);
      const distPx = Math.hypot(targetX - x, targetY - y);
      const distMeters = Math.round(distPx / 20);

      const orbitR = 40;
      const arrowTipX = x + Math.cos(angle) * orbitR;
      const arrowTipY = y + Math.sin(angle) * orbitR;

      ctx.save();
      ctx.translate(arrowTipX, arrowTipY);
      ctx.rotate(angle);

      // Glowing Arrow Body
      ctx.fillStyle = state.activeQuest ? "#38bdf8" : "#facc15";
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Distance & Target Badge Above Head
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = state.activeQuest ? "#38bdf8" : "#facc15";
      ctx.lineWidth = 1;
      const badgeW = 90;
      ctx.fillRect(x - badgeW / 2, y - 34, badgeW, 14);
      ctx.strokeRect(x - badgeW / 2, y - 34, badgeW, 14);

      ctx.fillStyle = state.activeQuest ? "#7dd3fc" : "#fef08a";
      ctx.font = "bold 8px 'Silkscreen', monospace, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(\`➔ \${distMeters}M: \${targetLabel.slice(0, 10)}\`, x, y - 24);
    }
  }`;

code = code.replace(oldWaypointBlockRegex, newWaypointBlock);

// C. Fix Minimap GPS route line when carrying a quest
const oldMinimapGpsRegex = /\/\/ 4\. Target Policy Station \(Pulsing Diamond & GPS Route Line[\s\S]*?\/\/ 5\. Remote Players/;

const newMinimapGps = `// 4. Target Policy Station or Delivery Destination GPS Line
    let gpsTargetX = null;
    let gpsTargetY = null;

    if (state.activeQuest) {
      const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
      const currentBuildings = getCurrentPhaseBuildings();
      const targetBldg = currentBuildings.find(b => b.id === currentStep.bldgId || b.type === currentStep.bldgId) || getBuildingById(currentStep.bldgId);
      if (targetBldg) {
        gpsTargetX = targetBldg.stationX !== undefined ? targetBldg.stationX : targetBldg.x;
        gpsTargetY = targetBldg.stationY !== undefined ? targetBldg.stationY : targetBldg.y;
      }
    } else if (state.policyStation && !state.taskCompletedByPlayer) {
      gpsTargetX = toWorldX(state.policyStation.x);
      gpsTargetY = toWorldY(state.policyStation.y);
    }

    if (gpsTargetX !== null && gpsTargetY !== null) {
      const stMmX = mapToMmX(gpsTargetX);
      const stMmY = mapToMmY(gpsTargetY);
      const pulseR = 5 + Math.sin(time * 6) * 2.5;

      context.fillStyle = state.activeQuest ? "rgba(56, 189, 248, 0.4)" : "rgba(250, 204, 21, 0.4)";
      context.beginPath();
      context.arc(stMmX, stMmY, pulseR + 2, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = state.activeQuest ? "#38bdf8" : "#facc15";
      context.beginPath();
      context.arc(stMmX, stMmY, 4, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = state.activeQuest ? "#38bdf8" : "#facc15";
      context.lineWidth = 1.5;
      context.setLineDash([3, 3]);
      context.beginPath();
      context.moveTo(mapToMmX(state.player.x), mapToMmY(state.player.y));
      context.lineTo(stMmX, stMmY);
      context.stroke();
      context.setLineDash([]);
    }

    // 5. Remote Players`;

code = code.replace(oldMinimapGpsRegex, newMinimapGps);

// D. Fix updateNearbyBuilding auto-delivery progression
const oldAutoDeliverRegex = /\/\/ Auto-progress delivery quest step when walking up to the building facade[\s\S]*?\n  \}\n\}/;

const newAutoDeliver = `// Auto-progress delivery quest step when walking up to the building facade
  if (state.activeQuest && closest) {
    const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
    if (currentStep && (currentStep.bldgId === closest.id || currentStep.bldgId === closest.type || closest.id.includes(currentStep.bldgId))) {
      const isTouching = minDist <= 95;
      if (isTouching && !state.activeQuest.justTriggered) {
        state.activeQuest.justTriggered = true;
        executePlayerAction();
        setTimeout(() => {
          if (state.activeQuest) state.activeQuest.justTriggered = false;
        }, 1200);
      }
    }
  }
}`;

code = code.replace(oldAutoDeliverRegex, newAutoDeliver);

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('Successfully upgraded game.js delivery mechanics and GPS routing');
