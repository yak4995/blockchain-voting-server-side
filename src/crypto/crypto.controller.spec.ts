import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { RSAService } from './rsa.service';
import { rsaProviders } from './rsa.providers';
import { DatabaseModule } from '../database/database.module';
import { CryptoController } from './crypto.controller';
import { SignPacketDTO } from './dto/sign-packet.dto';
import { VerifyPacketDTO } from './dto/verify-packet.dto';
import { AppLogger } from '../logger/app-logger.service';
import { MsgDTO } from './dto/message.dto';
import { MsgObjDTO } from './dto/msg-object.dto';
import { SignObjectPacketDTO } from './dto/sign-object-packet.dto';

const testMessage: string = '{"name": "Yurii"}',
  testMsgSign: string =
    '923e765b7d48ddbaa0788ca49d16ad23c7df62c4b0227e9a800efb74ba4b216d6171b9b73ee6499e2715d2b98c09b83cd7a4d937bbac3cb85e9710ae1ff54f7ba441a1e66447ae0feec914d2313b21943d978d5b1aa5c2ab3a2771b7d355d74eec61757a8c8daf92401494cc39f21c248c5405f7caafed645264239b573299efb0c8e45bee6ae8607994d3a173f7cb28586362dee3ed54131fd33dd9bc43ea9954d6d043f912330279c81bdb98fb40a243a4a8f78001fcbf72b0cecdb746dc711065581654aadc7daa200dec021a03327af84ca1603a6e06eed618370ec2d4b94b5f575fce8c00d98a670c33723983f82e27d896f20b4846c2969a352af5a576',
  testObj: object = { name: 'Yurii' },
  testMsgHash: string = '414e2c2392ffbcf56d957ac2d1257d4e7a5cb9f10778a6106b32cb11466fe0c2',
  testObjHash: string = '299a111f955545c7b49fc795a257e326fc1c5944fa698325cb4a78d3beec7dc2',
  testObjSign: string =
    '6f5b111f39fe74445194a2da1e693f59675de70239c4ef8c6926249f9a1bed850f9d0b28493694d6a617289d7cda7321930f83aa3cc56250b814b340b67c0c36607f5e73eeb7fd2a94a3c9fdf99ac5e9ddadd74e1cb10b707b5f9e872d89d60b75f982d9bdd3de3fa7bfb0cd1d60e92e30b2515c9394194095bb1e467799ba032933d6d606782c2ec0d688c8f32cf7f7fc9232a928ce3ffa6b68322137a298317c29dd1870366169dd2ba9baca50cdb9b1ad84ab9514f48d5a1d32777ac22eab986334780064b02a7a6118f7ea01781db4d71bda4f583c4e4c6177e7a9b0adc3a4b2d03df3794f641aafe1ec451eb2dcef88c0e253c07bcfccf819c11e2bf08b';

describe('CryptoController tests', () => {
  let cryptoController: CryptoController;

  beforeEach(async () => {
    const mockAppLoggerProvider = {
      provide: 'logger',
      useFactory: async () => {
        return new AppLogger('logs', 'crypto-test.txt');
      },
    };

    const module = await Test.createTestingModule({
      imports: [DatabaseModule, AuthModule],
      controllers: [CryptoController],
      providers: [mockAppLoggerProvider, RSAService, ...rsaProviders],
    }).compile();

    cryptoController = module.get<CryptoController>(CryptoController);
  });

  describe('getMsgHashTest', () => {
    it('should return a SHA-256 hash of {"name": "Yurii"} message', async () => {
      const testMsgHashPacket: MsgDTO = {
        msg: testMessage,
      };
      const result: string = testMsgHash;
      expect(await cryptoController.getMsgHash(testMsgHashPacket)).toBe(result);
    });
  });

  describe('getObjHashTest', () => {
    it('should return a sign of {name: "Yurii"} object', async () => {
      const testObjHashPacket: MsgObjDTO = {
        msg: testObj,
      };
      const result: string = testObjHash;
      expect(await cryptoController.getObjHash(testObjHashPacket)).toBe(result);
    });
  });

  describe('signMessageTest', () => {
    it('should return a sign of {"name": "Yurii"} message', async () => {
      const testSignPacket: SignPacketDTO = {
        message: testMessage,
        privateKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDns9uJZhyXSvvU\njE+CtkyV4BZl83dYZ97Iiz5D3EHCxjS/q2h4C+TuCOyLIP8UT98JL1SEdDuRZocX\n+nxuwaJ0zNodreqHfnw8R2uNxIwAlgunRkJQE0PlVlYJTFJcGphx8d2fZmKf2pN3\nsvvDKYG0HYMYBW/VNXfWH7RXI8fd2E+fnNpkkuQCX5v9C4Pxh7NedUXGqaQ7L8aY\n4knFFYLe9ul5pCKhLyJ1evNIde862aiYNi09a5LaKAgw1VqUZz/qBU1t7G9ebWUk\nnW6BWzgNiAlJDVh/WMrmumPBingxqyp7JxqKxRprVzxUlVYIs9/2kG21v6DwrxvZ\n0JolnjnXAgMBAAECggEASC/O2/XGPpSL9OJp+y1UmvUfxU+fBRoHXK+VDItYqZga\n4wRCHfSGtGpvV8FF90wTDseCK2oTDO/GcwAFOHR3arBP3CNNCD2t8xHFPnvXqm8U\n3l6TVmNKKe9GCsuOdUeL6yQRihHZ9Dei7g4DRgBuenEfYKKA/woTddCW3Pc207Ry\n24ViO1RlnuHU9ZzS+meJAdBYvish2Q+z885Zn40moSrXNxIo3s4dckoxX3Vlzgnt\niLMsVwtQ12hEvVq8YmiJ2OQPwuudW4uM6F4smG1XCiWFZ6TY/RFh2C0MrYKenzXB\nCEf1iUaOsZoOLL35R9WnPiitDOYR7ArQx8TxIL8QcQKBgQD/iMNz1VrJ4e7uw5A9\nX/bW1QHmXGFZTNet5DGgUsm5L8NBTsBo6xCG5Ik5FxwSw5FP0joPy3GJJgDAS3Zf\nJ4M6OiP18io5QyG9uj+/CqM9ISc4x0atrx2nSvOSVyK7QBx5SMlTvcFoZjlgrUtZ\n/4Ku7DyClL8JF3pY9BiV75VJnQKBgQDoH/lM323aV7bdunMeW0UjvFAPEMNQnu8w\n9dvMtFYXfa75tywLjA4N7q66jFeDZ0Mvvcawtp0iEYWwl7etzRICG7uej7Op8Vty\nNJbyW9aN7L9OX5grJyogTdRZK2xgHVw8hKDBsef8pNc/Prh3/RGbg9jBaG32yNKA\n6k+qESvBAwKBgQCQ5dI+2pqSo4TC6y3dP49OnpZnM7cX1hTuy9jAGnG8irLjU26T\nj8ddVjXho5MNqMu7QXAfCLOmm2ANqjzDFDq7R8Cgc+MxeTmmxffjsnqB7Uy6S3Vu\ng0ADXuLi9noBSAddVsKis5T6SAz9Hwb9T3+hBOADA6mX1DJSQoe2bZZvmQKBgQCT\njE9xd8xiL8NDadLnBukJ8BeLnAIq6vvryTvwAOmAgRmKDc7ngB0m6gMS/UZbdnYU\nkLMNfOag0zaBq87LoUDDKlG2Vm3DpnGURK12XL4i9Mwdy1H0jC6Q3igOjjWTWtZY\neY2d0bI+u6E+yGWFj81zZvmO5wyPA9QasdX1qnh/dQKBgAdDo4C+Wuebo0ZSy9sa\n9ziwiOA7rfvAXnSs6MPQGWRUyrTPm7pv//kcnNweXDV1VJOQkMOk40LTrpu1s68l\nJH6j4deaE11pDCoVLyCsWzO1Fyp6FMEeyJ9gtORQRRecS66wuOukGH3V2icE0ib4\nuzHaHCoSdDVCqQkRrQOeLOyj\n-----END PRIVATE KEY-----',
      };
      const result: string = testMsgSign;
      expect(await cryptoController.sign(testSignPacket)).toBe(result);
    });
  });

  describe('verifyMessageSignatureTest', () => {
    it('should return a verification of sign {"name": "Yurii"} message', async () => {
      const testVerifyPacket: VerifyPacketDTO = {
        message: testMessage,
        signature: testMsgSign,
        publicKey:
          '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA57PbiWYcl0r71IxPgrZM\nleAWZfN3WGfeyIs+Q9xBwsY0v6toeAvk7gjsiyD/FE/fCS9UhHQ7kWaHF/p8bsGi\ndMzaHa3qh358PEdrjcSMAJYLp0ZCUBND5VZWCUxSXBqYcfHdn2Zin9qTd7L7wymB\ntB2DGAVv1TV31h+0VyPH3dhPn5zaZJLkAl+b/QuD8YezXnVFxqmkOy/GmOJJxRWC\n3vbpeaQioS8idXrzSHXvOtmomDYtPWuS2igIMNValGc/6gVNbexvXm1lJJ1ugVs4\nDYgJSQ1Yf1jK5rpjwYp4MasqeycaisUaa1c8VJVWCLPf9pBttb+g8K8b2dCaJZ45\n1wIDAQAB\n-----END PUBLIC KEY-----',
      };
      const result: boolean = true;
      expect(await cryptoController.verify(testVerifyPacket)).toBe(result);
    });
  });

  describe('signObjTest', () => {
    it('should return a sign of {name: "Yurii"} object', async () => {
      const testSignObjPacket: SignObjectPacketDTO = {
        message: testObj,
        privateKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDns9uJZhyXSvvU\njE+CtkyV4BZl83dYZ97Iiz5D3EHCxjS/q2h4C+TuCOyLIP8UT98JL1SEdDuRZocX\n+nxuwaJ0zNodreqHfnw8R2uNxIwAlgunRkJQE0PlVlYJTFJcGphx8d2fZmKf2pN3\nsvvDKYG0HYMYBW/VNXfWH7RXI8fd2E+fnNpkkuQCX5v9C4Pxh7NedUXGqaQ7L8aY\n4knFFYLe9ul5pCKhLyJ1evNIde862aiYNi09a5LaKAgw1VqUZz/qBU1t7G9ebWUk\nnW6BWzgNiAlJDVh/WMrmumPBingxqyp7JxqKxRprVzxUlVYIs9/2kG21v6DwrxvZ\n0JolnjnXAgMBAAECggEASC/O2/XGPpSL9OJp+y1UmvUfxU+fBRoHXK+VDItYqZga\n4wRCHfSGtGpvV8FF90wTDseCK2oTDO/GcwAFOHR3arBP3CNNCD2t8xHFPnvXqm8U\n3l6TVmNKKe9GCsuOdUeL6yQRihHZ9Dei7g4DRgBuenEfYKKA/woTddCW3Pc207Ry\n24ViO1RlnuHU9ZzS+meJAdBYvish2Q+z885Zn40moSrXNxIo3s4dckoxX3Vlzgnt\niLMsVwtQ12hEvVq8YmiJ2OQPwuudW4uM6F4smG1XCiWFZ6TY/RFh2C0MrYKenzXB\nCEf1iUaOsZoOLL35R9WnPiitDOYR7ArQx8TxIL8QcQKBgQD/iMNz1VrJ4e7uw5A9\nX/bW1QHmXGFZTNet5DGgUsm5L8NBTsBo6xCG5Ik5FxwSw5FP0joPy3GJJgDAS3Zf\nJ4M6OiP18io5QyG9uj+/CqM9ISc4x0atrx2nSvOSVyK7QBx5SMlTvcFoZjlgrUtZ\n/4Ku7DyClL8JF3pY9BiV75VJnQKBgQDoH/lM323aV7bdunMeW0UjvFAPEMNQnu8w\n9dvMtFYXfa75tywLjA4N7q66jFeDZ0Mvvcawtp0iEYWwl7etzRICG7uej7Op8Vty\nNJbyW9aN7L9OX5grJyogTdRZK2xgHVw8hKDBsef8pNc/Prh3/RGbg9jBaG32yNKA\n6k+qESvBAwKBgQCQ5dI+2pqSo4TC6y3dP49OnpZnM7cX1hTuy9jAGnG8irLjU26T\nj8ddVjXho5MNqMu7QXAfCLOmm2ANqjzDFDq7R8Cgc+MxeTmmxffjsnqB7Uy6S3Vu\ng0ADXuLi9noBSAddVsKis5T6SAz9Hwb9T3+hBOADA6mX1DJSQoe2bZZvmQKBgQCT\njE9xd8xiL8NDadLnBukJ8BeLnAIq6vvryTvwAOmAgRmKDc7ngB0m6gMS/UZbdnYU\nkLMNfOag0zaBq87LoUDDKlG2Vm3DpnGURK12XL4i9Mwdy1H0jC6Q3igOjjWTWtZY\neY2d0bI+u6E+yGWFj81zZvmO5wyPA9QasdX1qnh/dQKBgAdDo4C+Wuebo0ZSy9sa\n9ziwiOA7rfvAXnSs6MPQGWRUyrTPm7pv//kcnNweXDV1VJOQkMOk40LTrpu1s68l\nJH6j4deaE11pDCoVLyCsWzO1Fyp6FMEeyJ9gtORQRRecS66wuOukGH3V2icE0ib4\nuzHaHCoSdDVCqQkRrQOeLOyj\n-----END PRIVATE KEY-----',
      };
      const result: string = testObjSign;
      expect(await cryptoController.signObject(testSignObjPacket)).toBe(result);
    });
  });

  describe('verifyObjSignTest', () => {
    it('should return a verification of sign {name: "Yurii"} object', async () => {
      const testVerifyObjSignPacket: VerifyPacketDTO = {
        message: JSON.stringify(testObj),
        signature: testObjSign,
        publicKey:
          '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA57PbiWYcl0r71IxPgrZM\nleAWZfN3WGfeyIs+Q9xBwsY0v6toeAvk7gjsiyD/FE/fCS9UhHQ7kWaHF/p8bsGi\ndMzaHa3qh358PEdrjcSMAJYLp0ZCUBND5VZWCUxSXBqYcfHdn2Zin9qTd7L7wymB\ntB2DGAVv1TV31h+0VyPH3dhPn5zaZJLkAl+b/QuD8YezXnVFxqmkOy/GmOJJxRWC\n3vbpeaQioS8idXrzSHXvOtmomDYtPWuS2igIMNValGc/6gVNbexvXm1lJJ1ugVs4\nDYgJSQ1Yf1jK5rpjwYp4MasqeycaisUaa1c8VJVWCLPf9pBttb+g8K8b2dCaJZ45\n1wIDAQAB\n-----END PUBLIC KEY-----',
      };
      const result: boolean = true;
      expect(await cryptoController.verify(testVerifyObjSignPacket)).toBe(result);
    });
  });
});
