// Metres, with +x right and +y down. Gravity models the playfield incline.
export const table = {
  width: 6, height: 10, gravity: 5.5, ballRadius: 0.13,
  walls: [
    [[0.35, 9.8], [0.35, 1.2]], [[0.35, 1.2], [1.2, 0.35]],
    [[1.2, 0.35], [4.8, 0.35]], [[4.8, 0.35], [5.65, 1.2]],
    [[5.65, 1.2], [5.65, 9.8]],
    [[0.35, 7], [1.65, 8.15]], [[5.65, 7], [4.35, 8.15]],
  ],
  flipperY: 8.2, flipperLength: 1.12, flipperRadius: 0.12,
  // Strong actuator: quick acceleration and firm hold under ball contact.
  restAngle: 0.42, raisedAngle: -0.5, motorSpeed: 30, returnSpeed: 22, motorTorque: 400,
  holdTorque: 100, returnTorque: 80, endStrokeAngle: 0.04,
};
