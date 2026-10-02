package com.digitalmoneyhouse.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class CardsPage {
    private WebDriver driver;
    private WebDriverWait wait;

    private By btnNuevaTarjeta = By.id("btn-nueva-tarjeta");
    private By emptyCardsMessage = By.id("empty-cards-message");
    private By cardsList = By.id("cards-list");
    private By inputCardNumber = By.id("input-card-number");
    private By inputCardExpiry = By.id("input-card-expiry");
    private By inputCardHolder = By.id("input-card-holder");
    private By inputCardCvv = By.id("input-card-cvv");
    private By btnContinuarAlta = By.id("btn-continuar-alta-tarjeta");
    private By cardPreview = By.id("card-preview");

    public CardsPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/cards");
    }

    public void clickNuevaTarjeta() {
        wait.until(ExpectedConditions.elementToBeClickable(btnNuevaTarjeta)).click();
    }

    public void fillCardForm(String number, String expiry, String holder, String cvv) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(inputCardNumber)).sendKeys(number);
        driver.findElement(inputCardExpiry).sendKeys(expiry);
        driver.findElement(inputCardHolder).sendKeys(holder);
        driver.findElement(inputCardCvv).sendKeys(cvv);
    }

    public String getDetectedBrandText() {
        WebElement preview = wait.until(ExpectedConditions.visibilityOfElementLocated(cardPreview));
        return preview.getText();
    }

    public void submitCard() {
        wait.until(ExpectedConditions.elementToBeClickable(btnContinuarAlta)).click();
    }

    public List<WebElement> getCardItems() {
        return driver.findElements(By.xpath("//div[@id='cards-list']//div[contains(@class,'flex items-center justify-between')]"));
    }

    public void deleteFirstCard() {
        List<WebElement> deleteButtons = driver.findElements(By.xpath("//button[contains(text(),'Eliminar')]"));
        if (!deleteButtons.isEmpty()) {
            deleteButtons.get(0).click();
            // Confirm browser alert if present
            try {
                driver.switchTo().alert().accept();
            } catch (Exception ignored) {
            }
        }
    }

    public boolean isNoCardsMessageDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(emptyCardsMessage)).isDisplayed();
    }
}
