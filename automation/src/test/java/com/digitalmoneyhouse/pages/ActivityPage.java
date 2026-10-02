package com.digitalmoneyhouse.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class ActivityPage {
    private WebDriver driver;
    private WebDriverWait wait;

    private By searchInput = By.id("activity-search-input");
    private By btnAbrirFiltros = By.id("btn-abrir-filtros");
    private By btnAplicarFiltros = By.id("btn-aplicar-filtros");
    private By btnBorrarFiltros = By.id("btn-borrar-filtros");
    private By activityListContainer = By.id("activity-list-container");

    public ActivityPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/activity");
    }

    public void searchKeyword(String keyword) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(searchInput));
        input.clear();
        input.sendKeys(keyword);
    }

    public void openFilters() {
        wait.until(ExpectedConditions.elementToBeClickable(btnAbrirFiltros)).click();
    }

    public void applyFilters() {
        wait.until(ExpectedConditions.elementToBeClickable(btnAplicarFiltros)).click();
    }

    public void clearFilters() {
        wait.until(ExpectedConditions.elementToBeClickable(btnBorrarFiltros)).click();
    }

    public List<WebElement> getActivityItems() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(activityListContainer));
        return driver.findElements(By.xpath("//div[@id='activity-list-container']/a"));
    }

    public void clickFirstActivity() {
        List<WebElement> items = getActivityItems();
        if (!items.isEmpty()) {
            items.get(0).click();
        }
    }

    public void clickPaginationPage(int pageNumber) {
        By pageBtn = By.id("page-btn-" + pageNumber);
        wait.until(ExpectedConditions.elementToBeClickable(pageBtn)).click();
    }
}
