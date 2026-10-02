package com.digitalmoneyhouse.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ProfilePage {
    private WebDriver driver;
    private WebDriverWait wait;

    private By editAliasBtn = By.id("edit-alias-btn");
    private By copyCvuBtn = By.id("copy-cvu-btn");
    private By copyAliasBtn = By.id("copy-alias-btn");
    private By btnGestionarMediosPago = By.id("btn-gestionar-medios-pago");
    private By saveProfileBtn = By.id("save-profile-btn");
    private By aliasInput = By.xpath("//input[contains(@placeholder,'palabra.palabra.palabra')]");
    private By passwordHiddenText = By.xpath("//span[contains(text(),'Contraseña')]/following-sibling::span[contains(text(),'******')]");

    public ProfilePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/profile");
    }

    public boolean isPasswordHidden() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(passwordHiddenText)).isDisplayed();
    }

    public void clickGestionarMediosPago() {
        wait.until(ExpectedConditions.elementToBeClickable(btnGestionarMediosPago)).click();
    }

    public void clickCopyCvu() {
        wait.until(ExpectedConditions.elementToBeClickable(copyCvuBtn)).click();
    }

    public void clickCopyAlias() {
        wait.until(ExpectedConditions.elementToBeClickable(copyAliasBtn)).click();
    }

    public void editAlias(String newAlias) {
        wait.until(ExpectedConditions.elementToBeClickable(editAliasBtn)).click();
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(aliasInput));
        input.clear();
        input.sendKeys(newAlias);
        wait.until(ExpectedConditions.elementToBeClickable(saveProfileBtn)).click();
    }
}
