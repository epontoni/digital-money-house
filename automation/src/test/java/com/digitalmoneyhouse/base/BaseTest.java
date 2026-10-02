package com.digitalmoneyhouse.base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.time.Duration;

public abstract class BaseTest {
    protected WebDriver driver;
    protected WebDriverWait wait;
    protected String baseUrl = "http://localhost:3000";

    @BeforeMethod
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1920,1080");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        // Can be run in headless mode via -Dheadless=true
        if (Boolean.parseBoolean(System.getProperty("headless", "false"))) {
            options.addArguments("--headless=new");
        }

        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(8));
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    /**
     * Injects authentication token into localStorage to fast-track test execution.
     */
    public void loginWithMockToken(String userId, String email, String name, String lastName) {
        driver.get(baseUrl + "/login");
        String payloadJson = String.format(
            "{\"id\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"lastName\":\"%s\",\"exp\":%d}",
            userId, email, name, lastName, System.currentTimeMillis() + 86400000L
        );
        String token = java.util.Base64.getEncoder().encodeToString(payloadJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("localStorage.setItem('dmh_token', arguments[0]);", token);
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
