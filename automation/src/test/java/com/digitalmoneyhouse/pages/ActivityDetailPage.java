package com.digitalmoneyhouse.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ActivityDetailPage {
    private WebDriver driver;
    private WebDriverWait wait;

    private By statusApproved = By.xpath("//span[contains(text(),'Aprobada')]");
    private By btnIrAlInicio = By.id("btn-detalle-ir-inicio");
    private By btnDescargarComprobante = By.id("btn-detalle-descargar-comprobante");

    public ActivityDetailPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isStatusApprovedDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(statusApproved)).isDisplayed();
    }

    public void clickDescargarComprobante() {
        wait.until(ExpectedConditions.elementToBeClickable(btnDescargarComprobante)).click();
    }

    public void clickIrAlInicio() {
        wait.until(ExpectedConditions.elementToBeClickable(btnIrAlInicio)).click();
    }
}
