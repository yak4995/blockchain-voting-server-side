import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { RSAService } from './rsa.service';
import { rsaProviders } from './rsa.providers';
import { DatabaseModule } from '../database/database.module';
import { CryptoController } from './crypto.controller';
import { SignPacketDTO } from './dto/sign-packet.dto';
import { VerifyPacketDTO } from './dto/verify-packet.dto';

const testMessage: string = '{name: \'Yurii\'}';
const testMsgSign: string = 'e5015e62a9afe528bafaa54ddeaa9927065394f9d004eca54a45abfe50eb9f342abaca5a27e2ea896cbcbac508f53b216c6ad1207f918608540f424e1fed763bb94d64797a9146f66782e6539adcb735f35428f88c70d79417b27c7c0644692a5845676c70a4b09f0ec016bf6eb6fbd3de3263e1a129cc9c0b058da63abbadb41a0c564e3fa02fc290d78836132d97c41a90ad56800cf3c2827fe42418576a7ccf84b4c334beb1d52b63c6a4fef82926937a7aa3a244d42e8e26b893701a1fbfd61960c02bc720e3f9ed7003ac3fc6b194e1a2d5e1a6bde23a9ecbf4260de8d47317c69e1b7538ae6f779b4c4424c426e882e51910a8839ea175c85979af395f';

describe('CryptoController', () => {

  let cryptoController: CryptoController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        AuthModule
      ],
      controllers: [CryptoController],
      providers: [RSAService, ...rsaProviders]
  }).compile();

    cryptoController = module.get<CryptoController>(CryptoController);
  });

  describe('signMessageTest', () => {
    it('should return a sign of {name: \'Yurii\'} message', async () => {
      const testSignPacket: SignPacketDTO = {
        message: testMessage,
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDns9uJZhyXSvvU\njE+CtkyV4BZl83dYZ97Iiz5D3EHCxjS/q2h4C+TuCOyLIP8UT98JL1SEdDuRZocX\n+nxuwaJ0zNodreqHfnw8R2uNxIwAlgunRkJQE0PlVlYJTFJcGphx8d2fZmKf2pN3\nsvvDKYG0HYMYBW/VNXfWH7RXI8fd2E+fnNpkkuQCX5v9C4Pxh7NedUXGqaQ7L8aY\n4knFFYLe9ul5pCKhLyJ1evNIde862aiYNi09a5LaKAgw1VqUZz/qBU1t7G9ebWUk\nnW6BWzgNiAlJDVh/WMrmumPBingxqyp7JxqKxRprVzxUlVYIs9/2kG21v6DwrxvZ\n0JolnjnXAgMBAAECggEASC/O2/XGPpSL9OJp+y1UmvUfxU+fBRoHXK+VDItYqZga\n4wRCHfSGtGpvV8FF90wTDseCK2oTDO/GcwAFOHR3arBP3CNNCD2t8xHFPnvXqm8U\n3l6TVmNKKe9GCsuOdUeL6yQRihHZ9Dei7g4DRgBuenEfYKKA/woTddCW3Pc207Ry\n24ViO1RlnuHU9ZzS+meJAdBYvish2Q+z885Zn40moSrXNxIo3s4dckoxX3Vlzgnt\niLMsVwtQ12hEvVq8YmiJ2OQPwuudW4uM6F4smG1XCiWFZ6TY/RFh2C0MrYKenzXB\nCEf1iUaOsZoOLL35R9WnPiitDOYR7ArQx8TxIL8QcQKBgQD/iMNz1VrJ4e7uw5A9\nX/bW1QHmXGFZTNet5DGgUsm5L8NBTsBo6xCG5Ik5FxwSw5FP0joPy3GJJgDAS3Zf\nJ4M6OiP18io5QyG9uj+/CqM9ISc4x0atrx2nSvOSVyK7QBx5SMlTvcFoZjlgrUtZ\n/4Ku7DyClL8JF3pY9BiV75VJnQKBgQDoH/lM323aV7bdunMeW0UjvFAPEMNQnu8w\n9dvMtFYXfa75tywLjA4N7q66jFeDZ0Mvvcawtp0iEYWwl7etzRICG7uej7Op8Vty\nNJbyW9aN7L9OX5grJyogTdRZK2xgHVw8hKDBsef8pNc/Prh3/RGbg9jBaG32yNKA\n6k+qESvBAwKBgQCQ5dI+2pqSo4TC6y3dP49OnpZnM7cX1hTuy9jAGnG8irLjU26T\nj8ddVjXho5MNqMu7QXAfCLOmm2ANqjzDFDq7R8Cgc+MxeTmmxffjsnqB7Uy6S3Vu\ng0ADXuLi9noBSAddVsKis5T6SAz9Hwb9T3+hBOADA6mX1DJSQoe2bZZvmQKBgQCT\njE9xd8xiL8NDadLnBukJ8BeLnAIq6vvryTvwAOmAgRmKDc7ngB0m6gMS/UZbdnYU\nkLMNfOag0zaBq87LoUDDKlG2Vm3DpnGURK12XL4i9Mwdy1H0jC6Q3igOjjWTWtZY\neY2d0bI+u6E+yGWFj81zZvmO5wyPA9QasdX1qnh/dQKBgAdDo4C+Wuebo0ZSy9sa\n9ziwiOA7rfvAXnSs6MPQGWRUyrTPm7pv//kcnNweXDV1VJOQkMOk40LTrpu1s68l\nJH6j4deaE11pDCoVLyCsWzO1Fyp6FMEeyJ9gtORQRRecS66wuOukGH3V2icE0ib4\nuzHaHCoSdDVCqQkRrQOeLOyj\n-----END PRIVATE KEY-----'
      };
      const result: string = testMsgSign;
      expect(await cryptoController.sign(testSignPacket)).toBe(result);
    });
  });

  describe('verifyMessageSignatureTest', () => {
    it('should return a sign of {name: \'Yurii\'} message', async () => {
      const testVerifyPacket: VerifyPacketDTO = {
        message: testMessage,
        signature: testMsgSign,
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA57PbiWYcl0r71IxPgrZM\nleAWZfN3WGfeyIs+Q9xBwsY0v6toeAvk7gjsiyD/FE/fCS9UhHQ7kWaHF/p8bsGi\ndMzaHa3qh358PEdrjcSMAJYLp0ZCUBND5VZWCUxSXBqYcfHdn2Zin9qTd7L7wymB\ntB2DGAVv1TV31h+0VyPH3dhPn5zaZJLkAl+b/QuD8YezXnVFxqmkOy/GmOJJxRWC\n3vbpeaQioS8idXrzSHXvOtmomDYtPWuS2igIMNValGc/6gVNbexvXm1lJJ1ugVs4\nDYgJSQ1Yf1jK5rpjwYp4MasqeycaisUaa1c8VJVWCLPf9pBttb+g8K8b2dCaJZ45\n1wIDAQAB\n-----END PUBLIC KEY-----'
      };
      const result: boolean = true;
      expect(await cryptoController.verify(testVerifyPacket)).toBe(result);
    });
  });
});