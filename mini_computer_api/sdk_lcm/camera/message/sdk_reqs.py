"""LCM type definitions
This file automatically generated by lcm.
DO NOT MODIFY BY HAND!!!!
"""

from io import BytesIO
import struct

class sdk_reqs(object):

    __slots__ = ["req"]

    __typenames__ = ["int32_t"]

    __dimensions__ = [None]

    def __init__(self):
        self.req = 0
        """ LCM Type: int32_t """

    def encode(self):
        buf = BytesIO()
        buf.write(sdk_reqs._get_packed_fingerprint())
        self._encode_one(buf)
        return buf.getvalue()

    def _encode_one(self, buf):
        buf.write(struct.pack(">i", self.req))

    @staticmethod
    def decode(data):
        if hasattr(data, 'read'):
            buf = data
        else:
            buf = BytesIO(data)
        if buf.read(8) != sdk_reqs._get_packed_fingerprint():
            raise ValueError("Decode error")
        return sdk_reqs._decode_one(buf)

    @staticmethod
    def _decode_one(buf):
        self = sdk_reqs()
        self.req = struct.unpack(">i", buf.read(4))[0]
        return self

    @staticmethod
    def _get_hash_recursive(parents):
        if sdk_reqs in parents: return 0
        tmphash = (0xd21b643a172a5657) & 0xffffffffffffffff
        tmphash  = (((tmphash<<1)&0xffffffffffffffff) + (tmphash>>63)) & 0xffffffffffffffff
        return tmphash
    _packed_fingerprint = None

    @staticmethod
    def _get_packed_fingerprint():
        if sdk_reqs._packed_fingerprint is None:
            sdk_reqs._packed_fingerprint = struct.pack(">Q", sdk_reqs._get_hash_recursive([]))
        return sdk_reqs._packed_fingerprint

    def get_hash(self):
        """Get the LCM hash of the struct"""
        return struct.unpack(">Q", sdk_reqs._get_packed_fingerprint())[0]

