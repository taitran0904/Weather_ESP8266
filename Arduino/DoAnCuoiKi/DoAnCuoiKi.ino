#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <Wire.h>;

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

int gasSensor;

#define DHTPIN 2
#define DHTTYPE DHT22
#define BUZZER_PIN 13 
#define LED_PIN 15

#define WIFI_SSID "KhanhHom24ghz"
#define WIFI_PASSWORD "kiettuan91"

#define API_KEY "AIzaSyAVKvG8t-VSCmoTN0vPBctAkAb9PPwly90"
#define DATABASE_URL "https://weather-app-aee77-default-rtdb.asia-southeast1.firebasedatabase.app/" 

#define USER_EMAIL "taitranonlyt100920@gmail.com"
#define USER_PASSWORD "123456"

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27,16,2);

FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

byte gasChar[8] = {
  0b11011,
  0b11011,
  0b10010,
  0b00000,
  0b00000,
  0b01010,
  0b10101,
  0b10101
};

byte degreeChar[8] = {
  0b11000,
  0b11000,
  0b00000,
  0b00110,
  0b01001,
  0b01000,
  0b01001,
  0b00110
};


void setup()
{
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);
    lcd.init();
    lcd.backlight();
    lcd.begin(16, 2);
    lcd.createChar(0, degreeChar);
    lcd.createChar(1, gasChar);
    Serial.begin(115200);
    Serial.println();
    Serial.println();
  
    dht.begin();

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    Serial.println();

    Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);

    /* Assign the api key (required) */
    config.api_key = API_KEY;

    /* Assign the user sign in credentials */
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;

    /* Assign the RTDB URL (required) */
    config.database_url = DATABASE_URL;

    /* Assign the callback function for the long running token generation task */
    config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

    Firebase.begin(&config, &auth);

    Firebase.reconnectWiFi(true);

    fbdo.setBSSLBufferSize(512, 2048);
}

void sendSensor(int t, int h, int gasSensor){
    //Hiển thị nhiệt độ, độ ẩm trên LCD
    lcd.setCursor(0,1);
    lcd.print("T:");
    lcd.print(t);
    lcd.write((byte)0);
    
    lcd.setCursor(6,1);
    lcd.print("H:");
    lcd.print(h);
    lcd.print("%");

    lcd.setCursor(12,1);
    lcd.print(gasSensor);
    lcd.write((byte)1);
    lcd.print(" ");

    //Hiển thị nhiệt độ, độ ẩm trên Serial
    Serial.print("Nhiet do: ");
    Serial.print(t); 
    Serial.println();
    
    Serial.print("Do am: ");
    Serial.print(h); 
    Serial.println();
    
    Serial.print("Nong do khi gas: ");
    Serial.println(gasSensor);

    //Đưa dữ liệu lên Firebase
    FirebaseJson json;
    json.add("nhietdo", t);
    json.add("doam", h);
    json.add("gas", gasSensor);

    if (Firebase.pushJSON(fbdo, "/data", json)) {
      Serial.println(fbdo.pushName());
      Firebase.setTimestamp(fbdo, "/data/" + fbdo.pushName() + "/timestamp");
    } else {
      Serial.println(fbdo.errorReason());
    }

    Firebase.setFloatAsync(fbdo, "/nhietdo", t);
    Firebase.setFloatAsync(fbdo, "/doam", h);
    Firebase.setFloatAsync(fbdo, "/gas", gasSensor);
  }

void loop() {
    int buzzerTimes = 5;
    unsigned long delayBuzzer = 250;
    float h = dht.readHumidity();
    float t = dht.readTemperature() - 4;
    
    if (isnan(h) || isnan(t)){
      Serial.println("Khong the doc duoc DHT");
      return;
    }
    
    gasSensor = analogRead(A0);
    sendSensor(t, h, gasSensor);
    
    if (gasSensor > 200) {
      lcd.setCursor(5, 0);
      lcd.print("WARNING");
      for(int i = 0; i < buzzerTimes; i++) {
        tone(BUZZER_PIN, 6000, delayBuzzer);
        digitalWrite(15, HIGH);
        delay(delayBuzzer);
        digitalWrite(15, LOW);
        delay(delayBuzzer);
      }
    } else {
      digitalWrite(15, LOW);
      lcd.setCursor(5, 0);
      lcd.print("NORMAL ");
    }
  delay(2000);
}
