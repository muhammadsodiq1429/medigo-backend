import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function start() {
  const app = await NestFactory.create(AppModule, {
    logger: ["debug", "error", "warn"],
  });
  const PORT = process.env.PORT || 3000;

  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Medigo")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter token",
        in: "header",
      },
      "JWT-auth"
    )
    .addSecurityRequirements("JWT-auth")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(PORT, () => {
    console.log(`Server started at: http://localhost:${PORT}`);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/docs`
    );
  });
}
start();
