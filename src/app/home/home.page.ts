import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx'
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';




  
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

 /*  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: Boolean;
  isArduinoConnected:Boolean;
  message:String; */

  pairedList: pairedlist;
  listToggle: boolean = false;
  pairedDeviceID: number = 0;
  dataSend: string = "";

  count:any;
  sayac:number=0;

  isOkay:boolean = false;
  progressBar = document.querySelector('.ion-progress-bar');
  goal:number;
  yourGoal:number;
  maxPercent:number;

  constructor(public bt:BluetoothSerial,public alert:AlertController, public toast: ToastController,private diagnostic: Diagnostic) {
    bt.enable();
   
  }


  ngOnInit() {
    this.timerCount()
    this.bluetooth();
  }
  
  checkBluetoothEnabled() {
    this.bt.isEnabled().then(success => {
      this.listPairedDevices();
    }, error => {
      this.showError("Please Enable Bluetooth")
    });
  }

  listPairedDevices() {
    this.bt.list().then(success => {
      this.pairedList = success;
      this.listToggle = true;
    }, error => {
      this.showError("Please Enable Bluetooth")
      this.listToggle = false;
    });
  }

  selectDevice() {
    let connectedDevice = this.pairedList[this.pairedDeviceID];
    //Arduino ya bağlanmayı engelliyor.
    /* if (!connectedDevice.address) {
      this.showError('Select Paired Device to connect');
      return;
    } */
    let address = connectedDevice.address;
    let name = connectedDevice.name;

    this.connect(address);
    this.read();
  }

  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bt.connect(address).subscribe(success => {
      this.deviceConnected();
      this.showToast("Successfully Connected");
    }, error => {
      this.showError("Error:Connecting to Device");
    });
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    if(!this.bt.isConnected){
      this.bt.subscribe('\n').subscribe(success => {
        this.handleData(success);
        this.read()
        this.isOkay = true
        this.showToast("Connected Successfullly");
      }, error => {
        this.showError(error);
      });
    }
   
  }


  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bt.disconnect();
    this.showToast("Device Disconnected");
  }

  handleData(data) {
    this.showToast(data);
  }

  sendData() {
    
    this.showToast(this.dataSend);

    this.bt.write(this.dataSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error)
    });
  }
 async showError(error) {
    let alert = await this.alert.create({
      message: error,
      buttons: ['Dismiss']
    });
    await alert.present();
  }

 async showToast(msj) {
    const toast = await this.toast.create({
      message: msj,
      showCloseButton: true,
      closeButtonText: 'Ok',
      duration: 4000
    });
   toast.present();
  }
  
  timerCount() {
    setInterval(this.read,600)
  }

  read() {
     this.bt.subscribeRawData().subscribe(data => {
       this.bt.read().then(veri => {
         this.count = veri
       })
     })
     
     /* this.bt.read().then(data => {
       this.count = data
     }) */
  }

  setGoal(goal) {
    this.yourGoal = goal;
    this.maxPercent = this.yourGoal;
  }

bluetooth() {
  this.diagnostic.getBluetoothState().then(result =>{ 
    if(result == 'powered_on'){
      this.showToast("açık")
    }
  })
}
  


}

interface pairedlist {
  "class": number,
  "id": string,
  "address": string,
  "name": string
}




