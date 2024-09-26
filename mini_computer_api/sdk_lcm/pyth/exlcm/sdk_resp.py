"""LCM type definitions
This file automatically generated by lcm.
DO NOT MODIFY BY HAND!!!!
"""


from io import BytesIO
import struct

class sdk_resp(object):

    __slots__ = ["resp_init", "resp_conn", "resp_status"]

    __typenames__ = ["boolean", "boolean", "boolean"]

    __dimensions__ = [None, None, None]

    def __init__(self):
        self.resp_init = False
        """ LCM Type: boolean """
        self.resp_conn = False
        """ LCM Type: boolean """
        self.resp_status = False
        """ LCM Type: boolean """

    def encode(self):
        buf = BytesIO()
        buf.write(sdk_resp._get_packed_fingerprint())
        self._encode_one(buf)
        return buf.getvalue()

    def _encode_one(self, buf):
        buf.write(struct.pack(">bbb", self.resp_init, self.resp_conn, self.resp_status))

    @staticmethod
    def decode(data):
        if hasattr(data, 'read'):
            buf = data
        else:
            buf = BytesIO(data)
        if buf.read(8) != sdk_resp._get_packed_fingerprint():
            raise ValueError("Decode error")
        return sdk_resp._decode_one(buf)

    @staticmethod
    def _decode_one(buf):
        self = sdk_resp()
        self.resp_init = bool(struct.unpack('b', buf.read(1))[0])
        self.resp_conn = bool(struct.unpack('b', buf.read(1))[0])
        self.resp_status = bool(struct.unpack('b', buf.read(1))[0])
        return self

    @staticmethod
    def _get_hash_recursive(parents):
        if sdk_resp in parents: return 0
        tmphash = (0x3ce32b2b3212fa65) & 0xffffffffffffffff
        tmphash  = (((tmphash<<1)&0xffffffffffffffff) + (tmphash>>63)) & 0xffffffffffffffff
        return tmphash
    _packed_fingerprint = None

    @staticmethod
    def _get_packed_fingerprint():
        if sdk_resp._packed_fingerprint is None:
            sdk_resp._packed_fingerprint = struct.pack(">Q", sdk_resp._get_hash_recursive([]))
        return sdk_resp._packed_fingerprint

    def get_hash(self):
        """Get the LCM hash of the struct"""
        return struct.unpack(">Q", sdk_resp._get_packed_fingerprint())[0]
