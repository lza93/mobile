import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, AfterContentInit } from '@angular/core';
import { NavParams, Content } from 'ionic-angular';

import { TabsComponent } from '../tabs/tabs.component';
import { Client } from '../../common/services/api/client';
import { CacheService } from '../../common/services/cache/cache.service';
import { Storage } from '../../common/services/storage';

import { CONFIG } from '../../config';
import { OnScreenService } from "../../common/services/visibility/on-screen.service";

@Component({
  moduleId: 'module.id',
  selector: 'group-profile',
  templateUrl: 'profile.component.html',
  //styleUrls: ['login.component.css']
})

export class GroupProfile implements OnInit, OnDestroy, AfterContentInit {

  guid : string = "";
  group;

  editing = {
    name: false
  }

  minds = {
    cdn_url: CONFIG.cdnUrl
  }

  @ViewChild('scrollArea') scrollArea: Content;
  onScreen = new OnScreenService();

  constructor(private client : Client, private params: NavParams, private cd : ChangeDetectorRef,
    private storage : Storage, private cache : CacheService){
  }

  ngOnInit(){
    this.guid = this.params.get('guid');
    this.load();
  }

  ngAfterContentInit() {
    this.onScreen.init(this.scrollArea);
  }

  ngOnDestroy() {
    this.onScreen.destroy();
  }

  load(){

    let _group = this.cache.get('group:' + this.guid);
    if(_group && !this.group){
      this.group = _group;
      this.cd.markForCheck();
      this.cd.detectChanges();
    }

    this.client.get('api/v1/groups/group/' + this.guid)
      .then((response : any) => {
        this.group = response.group;
        this.cache.set('group:' + this.guid, this.group, true);
        this.cd.markForCheck();
        this.cd.detectChanges();
      });
  }

  join(){
    this.group['is:member'] = true;
    this.cd.markForCheck();
    this.cd.detectChanges();
    this.client.put('api/v1/groups/membership/' + this.guid)
      .catch(() => {
        this.group['is:member'] = false;
      });
  }

  leave(){
    this.group['is:member'] = false;
    this.cd.markForCheck();
    this.cd.detectChanges();
    this.client.delete('api/v1/groups/membership/' + this.guid)
      .catch(() => {
        this.group['is:member'] = true;
      });
  }

}
