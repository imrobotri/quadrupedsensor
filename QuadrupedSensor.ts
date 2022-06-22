//############Ultrasound||超声波
enum PingUnit {
    //% block="μs"
    MicroSeconds,
    //% block="cm"
    Centimeters,
    //% block="inches"
    Inches
}
//############gesture||手势
enum gesture {
    //% block="From left to right"
    right = 1,
    //% block="Right to left"
    left = 2,
    //% block="Bottom up"
    up = 4,
    //% block="From top to bottom"
    down = 8,
    //% block="Back to front"
    forward = 16,
    //% block="From front to back"
    backward = 32,
    //% block="Clockwise"
    clockwise = 64,
    //% block="Counterclockwise"
    count_clockwise = 128,
    //% block="Wave"
    wave = 256

}

/**
 * Quadruped
 */
//% weight= 0 color=#0abcff icon="\uf201" block="QuadrupedSensor"
//% groups='["Location","Direction"]'
namespace QuadrupedSensor {
    //###Ultrasound||超声波
    /**
    * TODO:Select the transmit and receive pins corresponding to the robot ultrasonic module and select the units in which the data is returned.
    * TODO:选择机器人超声波模块对应的发射和接收引脚，并选择返回数据的单位。
    */
    //% blockGap=8
    //% blockId=QuadrupedSensor block="ping trig %trig|echo %echo|unit %unit"
    export function ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.Centimeters: return Math.idiv(d, 58);
            case PingUnit.Inches: return Math.idiv(d, 148);
            default: return d;
        }
    }
    //###Infrared||红外
    /**
     * TODO:The robot selects the data receiving pin of the infrared sensor, and the status return value 0 indicates that there is an obstacle and 1 indicates that the obstacle is not recognized.
     * TODO:机器人选择红外传感器的数据接收引脚，状态返回值0代表有障碍物，1代表未识别到障碍物。
     */
    //% blockGap=8
    //% blockId=QuadrupedSensorInfrared block="Infrared |mode %value |pin %pin"
    export function Infrared(pin: DigitalPin): number {
        pins.setPull(pin, PinPullMode.PullUp);
        return pins.digitalReadPin(pin);
    }
    //###Human body induction||人体感应
    /**
    * TODO:The robot selects the data receiving pin of the human sensor, and the status return value 0 represents that the human body is not recognized, and 1 represents the recognition of the human body.
    * TODO:机器人选择人体感应器的数据接收引脚，状态返回值0代表未识别到人体，1代表识别到人体。
    */
    //% blockGap=8
    //% blockId=QuadrupedSensorHuman_induction block="Human Infrared|pin|%pin"
    export function Human_induction(pin: AnalogPin, value = 50): number {
        let w = pins.analogReadPin(pin)
        if (w >= value)
            return 1
        return 0
    }
    //###GestureInit||手势初始化
    /**
    * IODO:Gesture related pins and configuration settings (success: 0 fail: 255)
    * IODO:手势相关引脚、配置设置（成功：0 失败：255）
    */
    //% blockGap=8
    //% blockId=QuadrupedSensorGestureInit block="GestureInit"
    export function GestureInit(): number {
        basic.pause(800);//等待芯片稳定
        if (GestureReadReg(0) != 0x20) {
            return 0xff;
        }
        for (let i = 0; i < Init_Register_Array.length; i++) {
            GestureWriteReg(Init_Register_Array[i][0], Init_Register_Array[i][1]);
        }
        GestureSelectBank(0);
        for (let i = 0; i < Init_Gesture_Array.length; i++) {
            GestureWriteReg(Init_Gesture_Array[i][0], Init_Gesture_Array[i][1]);
        }
        return 0;
    }
    //###GetGesture||获取手势
    /**
    * IODO:Returns the value of the gesture direction
    * IODO:返回手势方向的值
    */
    //% blockGap=8
    //% blockId=QuadrupedSensorGetGesture block="GetGesture"
    export function GetGesture(): number {

        let date = GestureReadReg(0x43);

        switch (date) {
            case GES_RIGHT_FLAG:
            case GES_LEFT_FLAG:
            case GES_UP_FLAG:
            case GES_DOWN_FLAG:
            case GES_FORWARD_FLAG:
            case GES_BACKWARD_FLAG:
            case GES_CLOCKWISE_FLAG:
            case GES_COUNT_CLOCKWISE_FLAG:
                break;
            default:
                date = GestureReadReg(0x44);
                if (date == GES_WAVE_FLAG) {
                    return 256;
                }
                break;
        }
        return date;
    }

    //###Select_gesture_as||选择手势为
    /**
    * IODO:Defines the direction of the gesture and sets it to a value.
    * IODO:定义手势的方向并设置为一个值。
    */
    //% blockGap=8
    //% blockId=QuadrupedSensorSelect_gesture_as block="Select_gesture_as | %state"
    export function Select_gesture_as(state: gesture): number {
        return state;
    }
}