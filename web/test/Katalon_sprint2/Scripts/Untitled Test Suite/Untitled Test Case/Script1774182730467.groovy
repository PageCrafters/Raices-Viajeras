import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.checkpoint.CheckpointFactory as CheckpointFactory
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as MobileBuiltInKeywords
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testcase.TestCaseFactory as TestCaseFactory
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testdata.TestDataFactory as TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository as ObjectRepository
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WSBuiltInKeywords
import com.kms.katalon.core.webui.driver.DriverFactory as DriverFactory
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUiBuiltInKeywords
import internal.GlobalVariable as GlobalVariable
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.testobject.SelectorMethod

import com.thoughtworks.selenium.Selenium
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.WebDriver
import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium
import static org.junit.Assert.*
import java.util.regex.Pattern
import static org.apache.commons.lang3.StringUtils.join
import org.testng.asserts.SoftAssert
import com.kms.katalon.core.testdata.CSVData
import org.openqa.selenium.Keys as Keys

SoftAssert softAssertion = new SoftAssert();
WebUI.openBrowser('https://www.google.com/')
def driver = DriverFactory.getWebDriver()
String baseUrl = "https://www.google.com/"
selenium = new WebDriverBackedSelenium(driver, baseUrl)
selenium.open("http://localhost/Raices-Viajeras/index.html")
selenium.click("link=Apúntate hoy")
selenium.open("http://localhost/Raices-Viajeras/web/Formulario/form.html?modo=registro")
selenium.click("id=nombre_completo")
selenium.type("id=nombre_completo", ("ana lopez").toString())
selenium.click("xpath=//form[@action='php/registros_usuarios.php']")
selenium.type("id=nombre_completo", "a")
selenium.click("id=correo")
selenium.type("id=correo", "a")
selenium.click("id=error-correo")
selenium.click("id=correo")
selenium.click("id=pwd")
selenium.type("id=pwd", "a")
selenium.click("id=pwdConfirm")
selenium.type("id=pwdConfirm", "a")
selenium.click("xpath=//div[@id='auth-slider']/div[2]/form[2]/div/label")
selenium.click("xpath=//div[@id='auth-slider']/div[2]/form[2]/button")
selenium.click("id=nombre_completo")
selenium.type("id=nombre_completo", ("ana lopez").toString())
selenium.click("xpath=//form[@action='php/registros_usuarios.php']")
selenium.type("id=correo", ("analopez@gmail.com").toString())
selenium.click("id=pwd")
selenium.click("id=auth-slider")
selenium.type("id=pwd", ("AnaLopez123!").toString())
selenium.type("id=pwdConfirm", ("AnaLopez123!").toString())
selenium.click("xpath=//div[@id='auth-slider']/div[2]/form[2]/div/label[2]")
selenium.click("id=fechaNacimiento")
selenium.type("id=fechaNacimiento", ("0002-02-13").toString())
selenium.type("id=fechaNacimiento", ("0020-02-13").toString())
selenium.type("id=fechaNacimiento", ("0200-02-13").toString())
selenium.type("id=fechaNacimiento", ("2000-02-13").toString())
selenium.click("id=politica_privacidad")
selenium.click("id=revista")
selenium.click("xpath=//div[@id='auth-slider']/div[2]/form[2]/button")
selenium.open("http://localhost/Raices-Viajeras/web/Formulario/php/registros_usuarios.php")
selenium.open("http://localhost/Raices-Viajeras/web/Formulario/form.html?modo=login")
selenium.click("id=correo_login")
selenium.type("id=correo_login", ("analopez@gmail.com").toString())
selenium.click("id=pwd_login")
selenium.type("id=pwd_login", ("AnaLopez123!").toString())
selenium.submit("css=.formulario_login")
selenium.open("http://localhost/Raices-Viajeras/web/Formulario/php/login_usuarios.php")
selenium.open("http://localhost/Raices-Viajeras/index.html")
selenium.click("xpath=//div[@id='navMenu']/ul/li/button/i")
selenium.click("xpath=//div[@id='navMenu']/ul/li/button/i")
selenium.click("link=Conócenos")
selenium.open("http://localhost/Raices-Viajeras/web/html/conocenos.html")
selenium.click("xpath=//body[@id='body']/section[7]/div[2]/button")
selenium.open("http://localhost/Raices-Viajeras/index.html")
selenium.click("link=Blog")
selenium.open("http://localhost/Raices-Viajeras/web/html/blog.html")
selenium.click("xpath=//ul[@id='lista-categorias']/li")
selenium.click("xpath=//ul[@id='lista-categorias']/li[2]")
selenium.click("xpath=//ul[@id='lista-categorias']/li[3]")
selenium.click("xpath=//div[@id='noticias-container']/div[2]/div/div/a")
selenium.open("http://localhost/Raices-Viajeras/web/html/articulo.html?id=2")
selenium.click("link=Viajes")
selenium.open("http://localhost/Raices-Viajeras/web/html/provincias.html")
selenium.click("id=buscador-input")
selenium.type("id=buscador-input", "lugo")
selenium.click("id=buscador-btn")
selenium.click("xpath=//div[@id='provincias-wrap']/div/div/div")
selenium.open("http://localhost/Raices-Viajeras/web/html/destinos.html?provincia_id=5")
selenium.click("xpath=//div[@id='viajes-wrap']/div[2]/div/div[2]/div[2]/div/a")
selenium.open("http://localhost/Raices-Viajeras/web/html/infoAventura.html?viaje=10")
selenium.click("xpath=//div[@id='viaje-detail']/article/div/div[2]/div/div[2]/div[2]/button")
selenium.click("link=Volver a destinos")
selenium.open("http://localhost/Raices-Viajeras/web/html/destinos.html?provincia_id=5")
selenium.click("xpath=//div[@id='viajes-wrap']/div/div/div[2]/div[2]/div/button")
selenium.click("xpath=//button[@id='header-cart-trigger']/i")
selenium.click("xpath=//div[@id='cesta-modal-items']/article/div/div/button")
selenium.click("id=cesta-modal-cta")
selenium.open("http://localhost/Raices-Viajeras/web/html/paga.html")
selenium.click("link=Seguir explorando")
selenium.open("http://localhost/Raices-Viajeras/web/html/provincias.html")
selenium.click("link=Cerrar sesión")
selenium.open("http://localhost/Raices-Viajeras/index.html")
selenium.click("link=Iniciar sesión")
selenium.open("http://localhost/Raices-Viajeras/web/Formulario/form.html?modo=login")
selenium.click("xpath=//form[@action='php/login_usuarios.php']")
selenium.click("id=correo_login")
selenium.type("id=correo_login", ("admin@gmail.com").toString())
selenium.click("id=pwd_login")
selenium.type("id=pwd_login", ("Admin123!").toString())
selenium.submit("css=.formulario_login")
selenium.open("http://localhost/Raices-Viajeras/web/Formulario/php/login_usuarios.php")
selenium.open("http://localhost/Raices-Viajeras/index.html")
selenium.click("link=Panel Admin")
selenium.open("http://localhost/Raices-Viajeras/web/html/admin.html")
selenium.click("id=nav-usuarios")
selenium.click("id=nav-viajes")
selenium.click("xpath=//button[@onclick='abrirModalViaje({ id: 10 })']")
selenium.click("id=v-plazas")
selenium.type("id=v-plazas", "16")
selenium.click("xpath=//div[@id='modalViaje']/div/div/div[3]/button[2]")
selenium.click("id=nav-categorias")
selenium.click("id=nav-usuarios")
selenium.click("xpath=//tbody[@id='tabla-usuarios']/tr/td[7]/div/button[2]/i")
selenium.click("id=btn-confirmar-eliminar")
