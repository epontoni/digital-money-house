package com.digitalmoneyhouse.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class DashboardPage {
    private WebDriver driver;
    private WebDriverWait wait;

    private By headerUserBadge = By.id("header-user-badge");
    private By linkVerTarjetas = By.id("link-ver-tarjetas");
    private By linkVerCvu = By.id("link-ver-cvu");
    private By btnTransferirDinero = By.id("btn-transferir-dinero");
    private By btnPagoServicios = By.id("btn-pago-servicios");
    private By inputSearchActivity = By.id("input-search-activity");
    private By linkVerTodaActividad = By.id("link-ver-toda-actividad");
    private By balanceContainer = By.xpath("//p[contains(text(),'Dinero disponible')]/following-sibling::div//span");

    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/home");
    }

    public String getAvailableBalanceText() {
        WebElement balanceSpan = wait.until(ExpectedConditions.visibilityOfElementLocated(balanceContainer));
        return balanceSpan.getText();
    }

    public void clickHeaderUserBadge() {
        wait.until(ExpectedConditions.elementToBeClickable(headerUserBadge)).click();
    }

    public void clickVerTarjetas() {
        wait.until(ExpectedConditions.elementToBeClickable(linkVerTarjetas)).click();
    }

    public void clickVerCvu() {
        wait.until(ExpectedConditions.elementToBeClickable(linkVerCvu)).click();
    }

    public void searchActivityAndPressEnter(String term) {
        WebElement searchInput = wait.until(ExpectedConditions.visibilityOfElementLocated(inputSearchActivity));
        searchInput.clear();
        searchInput.sendKeys(term);
        searchInput.sendKeys(Keys.ENTER);
    }

    public void clickVerTodaActividad() {
        wait.until(ExpectedConditions.elementToBeClickable(linkVerTodaActividad)).click();
    }

    public void clickSidebarLink(String linkText) {
        By sidebarItem = By.xpath("//aside//a[contains(text(),'" + linkText + "')]");
        wait.until(ExpectedConditions.elementToBeClickable(sidebarItem)).click();
    }
}
