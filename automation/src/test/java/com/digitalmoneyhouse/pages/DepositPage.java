package com.digitalmoneyhouse.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class DepositPage {
    private WebDriver driver;
    private WebDriverWait wait;

    private By btnMetodoTransferencia = By.id("btn-metodo-transferencia");
    private By btnMetodoTarjeta = By.id("btn-metodo-tarjeta");
    private By btnContinuarSeleccionTarjeta = By.id("btn-continuar-seleccion-tarjeta");
    private By inputDepositAmount = By.id("input-deposit-amount");
    private By btnContinuarMonto = By.id("btn-continuar-monto");
    private By btnConfirmarIngreso = By.id("btn-confirmar-ingreso");
    private By btnDescargarComprobante = By.id("btn-descargar-comprobante-deposito");
    private By successBannerText = By.xpath("//h2[contains(text(),'Ya cargamos el dinero en tu cuenta')]");
    private By copyCvuBtn = By.id("copy-cvu-deposit-btn");
    private By copyAliasBtn = By.id("copy-alias-deposit-btn");

    public DepositPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/deposit");
    }

    public void selectCardMethod() {
        wait.until(ExpectedConditions.elementToBeClickable(btnMetodoTarjeta)).click();
    }

    public void selectExternalTransferMethod() {
        wait.until(ExpectedConditions.elementToBeClickable(btnMetodoTransferencia)).click();
    }

    public void continueWithSelectedCard() {
        wait.until(ExpectedConditions.elementToBeClickable(btnContinuarSeleccionTarjeta)).click();
    }

    public void enterAmountAndContinue(String amount) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(inputDepositAmount));
        input.clear();
        input.sendKeys(amount);
        wait.until(ExpectedConditions.elementToBeClickable(btnContinuarMonto)).click();
    }

    public void confirmReview() {
        wait.until(ExpectedConditions.elementToBeClickable(btnConfirmarIngreso)).click();
    }

    public boolean isDepositSuccessBannerDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successBannerText)).isDisplayed();
    }

    public void clickDescargarComprobante() {
        wait.until(ExpectedConditions.elementToBeClickable(btnDescargarComprobante)).click();
    }

    public void clickCopyCvu() {
        wait.until(ExpectedConditions.elementToBeClickable(copyCvuBtn)).click();
    }

    public void clickCopyAlias() {
        wait.until(ExpectedConditions.elementToBeClickable(copyAliasBtn)).click();
    }
}
