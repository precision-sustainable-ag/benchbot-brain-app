
from common.motor_controller_xz import MotorControllerXZ
import time
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            

xz_motor_control = MotorControllerXZ()


def move_xz_axis(x, z):
    return xz_motor_control.move_motors(x, z)


def home_x():
    return xz_motor_control.homing_x()


def home_z():
    return xz_motor_control.homing_z()


def update_udp_config(udp_ip, udp_port):
    xz_motor_control.update_config(udp_ip, udp_port)


if __name__ == "__main__":
    # home_x()
    # home_z()
    if xz_motor_control.conn_status:
        print("Connected!")
    else:
        print("Not Connected!")

    time.sleep(5)
    move_xz_axis(10, 0)
    time.sleep(2)
    move_xz_axis(0, 10)
    time.sleep(2)
    move_xz_axis(10, 10)
    # print(xz_motor_control.init_connection())

    # print(xz_motor_control.conn_status)
    # update_udp_config("10.95.76.21", 8888)
