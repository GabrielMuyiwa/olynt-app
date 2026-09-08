"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[59],{53059:function(e,t,n){let a,i,r,o;n.r(t),n.d(t,{getAnalytics:function(){return ej},getGoogleAnalyticsClientId:function(){return eF},initializeAnalytics:function(){return eD},isSupported:function(){return eP},logEvent:function(){return ez},setAnalyticsCollectionEnabled:function(){return eE},setConsent:function(){return eO},setCurrentScreen:function(){return eq},setDefaultEventParameters:function(){return eN},setUserId:function(){return eM},setUserProperties:function(){return ex},settings:function(){return eA}});var s=n(32238),l=n(53333),c=n(74444),u=n(8463),d=n(26531);let f="@firebase/installations",p="0.6.12",h=`w:${p}`,g="FIS_v2",m=new c.LL("installations","Installations",{"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."});function w(e){return e instanceof c.ZR&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function y({projectId:e}){return`https://firebaseinstallations.googleapis.com/v1/projects/${e}/installations`}function b(e){return{token:e.token,requestStatus:2,expiresIn:Number(e.expiresIn.replace("s","000")),creationTime:Date.now()}}async function v(e,t){let n=await t.json(),a=n.error;return m.create("request-failed",{requestName:e,serverCode:a.code,serverMessage:a.message,serverStatus:a.status})}function I({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}async function T(e){let t=await e();return t.status>=500&&t.status<600?e():t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function k({appConfig:e,heartbeatServiceProvider:t},{fid:n}){let a=y(e),i=I(e),r=t.getImmediate({optional:!0});if(r){let e=await r.getHeartbeatsHeader();e&&i.append("x-firebase-client",e)}let o={fid:n,authVersion:g,appId:e.appId,sdkVersion:h},s={method:"POST",headers:i,body:JSON.stringify(o)},l=await T(()=>fetch(a,s));if(l.ok){let e=await l.json(),t={fid:e.fid||n,registrationStatus:2,refreshToken:e.refreshToken,authToken:b(e.authToken)};return t}throw await v("Create Installation",l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let S=/^[cdef][\w-]{21}$/;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let A=new Map;function j(e,t){let n=$(e);D(n,t),function(e,t){let n=(!P&&"BroadcastChannel"in self&&((P=new BroadcastChannel("[Firebase] FID Change")).onmessage=e=>{D(e.data.key,e.data.fid)}),P);n&&n.postMessage({key:e,fid:t}),0===A.size&&P&&(P.close(),P=null)}(n,t)}function D(e,t){let n=A.get(e);if(n)for(let e of n)e(t)}let P=null,q="firebase-installations-store",F=null;function M(){return F||(F=(0,d.X3)("firebase-installations-database",1,{upgrade:(e,t)=>{0===t&&e.createObjectStore(q)}})),F}async function x(e,t){let n=$(e),a=await M(),i=a.transaction(q,"readwrite"),r=i.objectStore(q),o=await r.get(n);return await r.put(t,n),await i.done,o&&o.fid===t.fid||j(e,t.fid),t}async function E(e){let t=$(e),n=await M(),a=n.transaction(q,"readwrite");await a.objectStore(q).delete(t),await a.done}async function N(e,t){let n=$(e),a=await M(),i=a.transaction(q,"readwrite"),r=i.objectStore(q),o=await r.get(n),s=t(o);return void 0===s?await r.delete(n):await r.put(s,n),await i.done,s&&(!o||o.fid!==s.fid)&&j(e,s.fid),s}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function z(e){let t;let n=await N(e.appConfig,n=>{let a=function(e){let t=e||{fid:function(){try{let e=new Uint8Array(17),t=self.crypto||self.msCrypto;t.getRandomValues(e),e[0]=112+e[0]%16;let n=function(e){let t=/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){let t=btoa(String.fromCharCode(...e));return t.replace(/\+/g,"-").replace(/\//g,"_")}(e);return t.substr(0,22)}(e);return S.test(n)?n:""}catch(e){return""}}(),registrationStatus:0};return K(t)}(n),i=function(e,t){if(0===t.registrationStatus){if(!navigator.onLine){let e=Promise.reject(m.create("app-offline"));return{installationEntry:t,registrationPromise:e}}let n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},a=O(e,n);return{installationEntry:n,registrationPromise:a}}return 1===t.registrationStatus?{installationEntry:t,registrationPromise:_(e)}:{installationEntry:t}}(e,a);return t=i.registrationPromise,i.installationEntry});return""===n.fid?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}async function O(e,t){try{let n=await k(e,t);return x(e.appConfig,n)}catch(n){throw w(n)&&409===n.customData.serverCode?await E(e.appConfig):await x(e.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function _(e){let t=await L(e.appConfig);for(;1===t.registrationStatus;)await C(100),t=await L(e.appConfig);if(0===t.registrationStatus){let{installationEntry:t,registrationPromise:n}=await z(e);return n||t}return t}function L(e){return N(e,e=>{if(!e)throw m.create("installation-not-found");return K(e)})}function K(e){return 1===e.registrationStatus&&e.registrationTime+1e4<Date.now()?{fid:e.fid,registrationStatus:0}:e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U({appConfig:e,heartbeatServiceProvider:t},n){let a=function(e,{fid:t}){return`${y(e)}/${t}/authTokens:generate`}(e,n),i=function(e,{refreshToken:t}){let n=I(e);return n.append("Authorization",`${g} ${t}`),n}(e,n),r=t.getImmediate({optional:!0});if(r){let e=await r.getHeartbeatsHeader();e&&i.append("x-firebase-client",e)}let o={installation:{sdkVersion:h,appId:e.appId}},s={method:"POST",headers:i,body:JSON.stringify(o)},l=await T(()=>fetch(a,s));if(l.ok){let e=await l.json(),t=b(e);return t}throw await v("Generate Auth Token",l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function R(e,t=!1){let n;let a=await N(e.appConfig,a=>{var i;if(!V(a))throw m.create("not-registered");let r=a.authToken;if(!t&&2===(i=r).requestStatus&&!function(e){let t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+36e5}(i))return a;if(1===r.requestStatus)return n=X(e,t),a;{if(!navigator.onLine)throw m.create("app-offline");let t=function(e){let t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},e),{authToken:t})}(a);return n=H(e,t),t}}),i=n?await n:a.authToken;return i}async function X(e,t){let n=await B(e.appConfig);for(;1===n.authToken.requestStatus;)await C(100),n=await B(e.appConfig);let a=n.authToken;return 0===a.requestStatus?R(e,t):a}function B(e){return N(e,e=>{if(!V(e))throw m.create("not-registered");let t=e.authToken;return 1===t.requestStatus&&t.requestTime+1e4<Date.now()?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function H(e,t){try{let n=await U(e,t),a=Object.assign(Object.assign({},t),{authToken:n});return await x(e.appConfig,a),n}catch(n){if(w(n)&&(401===n.customData.serverCode||404===n.customData.serverCode))await E(e.appConfig);else{let n=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await x(e.appConfig,n)}throw n}}function V(e){return void 0!==e&&2===e.registrationStatus}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function G(e){let{installationEntry:t,registrationPromise:n}=await z(e);return n?n.catch(console.error):R(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function W(e,t=!1){await Z(e);let n=await R(e,t);return n.token}async function Z(e){let{registrationPromise:t}=await z(e);t&&await t}function J(e){return m.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Y="installations";(0,s.Xd)(new u.wA(Y,e=>{let t=e.getProvider("app").getImmediate(),n=/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){if(!e||!e.options)throw J("App Configuration");if(!e.name)throw J("App Name");for(let t of["projectId","apiKey","appId"])if(!e.options[t])throw J(t);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}(t),a=(0,s.qX)(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:a,_delete:()=>Promise.resolve()}},"PUBLIC")),(0,s.Xd)(new u.wA("installations-internal",e=>{let t=e.getProvider("app").getImmediate(),n=(0,s.qX)(t,Y).getImmediate();return{getId:()=>G(n),getToken:e=>W(n,e)}},"PRIVATE")),(0,s.KN)(f,p),(0,s.KN)(f,p,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Q="analytics",ee="https://www.googletagmanager.com/gtag/js",et=new l.Yd("@firebase/analytics"),en=new c.LL("analytics","Analytics",{"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."});/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ea(e){if(!e.startsWith(ee)){let t=en.create("invalid-gtag-resource",{gtagURL:e});return et.warn(t.message),""}return e}function ei(e){return Promise.all(e.map(e=>e.catch(e=>e)))}async function er(e,t,n,a,i,r){let o=a[i];try{if(o)await t[o];else{let e=await ei(n),a=e.find(e=>e.measurementId===i);a&&await t[a.appId]}}catch(e){et.error(e)}e("config",i,r)}async function eo(e,t,n,a,i){try{let r=[];if(i&&i.send_to){let e=i.send_to;Array.isArray(e)||(e=[e]);let a=await ei(n);for(let n of e){let e=a.find(e=>e.measurementId===n),i=e&&t[e.appId];if(i)r.push(i);else{r=[];break}}}0===r.length&&(r=Object.values(t)),await Promise.all(r),e("event",a,i||{})}catch(e){et.error(e)}}let es=new class{constructor(e={},t=1e3){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}};async function el(e){var t;let{appId:n,apiKey:a}=e,i={method:"GET",headers:new Headers({Accept:"application/json","x-goog-api-key":a})},r="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig".replace("{app-id}",n),o=await fetch(r,i);if(200!==o.status&&304!==o.status){let e="";try{let n=await o.json();(null===(t=n.error)||void 0===t?void 0:t.message)&&(e=n.error.message)}catch(e){}throw en.create("config-fetch-failed",{httpStatus:o.status,responseMessage:e})}return o.json()}async function ec(e,t=es,n){let{appId:a,apiKey:i,measurementId:r}=e.options;if(!a)throw en.create("no-app-id");if(!i){if(r)return{measurementId:r,appId:a};throw en.create("no-api-key")}let o=t.getThrottleMetadata(a)||{backoffCount:0,throttleEndTimeMillis:Date.now()},s=new ed;return setTimeout(async()=>{s.abort()},void 0!==n?n:6e4),eu({appId:a,apiKey:i,measurementId:r},o,s,t)}async function eu(e,{throttleEndTimeMillis:t,backoffCount:n},a,i=es){var r;let{appId:o,measurementId:s}=e;try{await new Promise((e,n)=>{let i=Math.max(t-Date.now(),0),r=setTimeout(e,i);a.addEventListener(()=>{clearTimeout(r),n(en.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}catch(e){if(s)return et.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${s} provided in the "measurementId" field in the local Firebase config. [${null==e?void 0:e.message}]`),{appId:o,measurementId:s};throw e}try{let t=await el(e);return i.deleteThrottleMetadata(o),t}catch(u){if(!function(e){if(!(e instanceof c.ZR)||!e.customData)return!1;let t=Number(e.customData.httpStatus);return 429===t||500===t||503===t||504===t}(u)){if(i.deleteThrottleMetadata(o),s)return et.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${s} provided in the "measurementId" field in the local Firebase config. [${null==u?void 0:u.message}]`),{appId:o,measurementId:s};throw u}let t=503===Number(null===(r=null==u?void 0:u.customData)||void 0===r?void 0:r.httpStatus)?(0,c.$s)(n,i.intervalMillis,30):(0,c.$s)(n,i.intervalMillis),l={throttleEndTimeMillis:Date.now()+t,backoffCount:n+1};return i.setThrottleMetadata(o,l),et.debug(`Calling attemptFetch again in ${t} millis`),eu(e,l,a,i)}}class ed{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function ef(e,t,n,a,i){if(i&&i.global){e("event",n,a);return}{let i=await t,r=Object.assign(Object.assign({},a),{send_to:i});e("event",n,r)}}async function ep(e,t,n,a){if(a&&a.global)return e("set",{screen_name:n}),Promise.resolve();{let a=await t;e("config",a,{update:!0,screen_name:n})}}async function eh(e,t,n,a){if(a&&a.global)return e("set",{user_id:n}),Promise.resolve();{let a=await t;e("config",a,{update:!0,user_id:n})}}async function eg(e,t,n,a){if(a&&a.global){let t={};for(let e of Object.keys(n))t[`user_properties.${e}`]=n[e];return e("set",t),Promise.resolve()}{let a=await t;e("config",a,{update:!0,user_properties:n})}}async function em(e,t){let n=await t;return new Promise((t,a)=>{e("get",n,"client_id",e=>{e||a(en.create("no-client-id")),t(e)})})}async function ew(e,t){let n=await e;window[`ga-disable-${n}`]=!t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ey(){if(!(0,c.hl)())return et.warn(en.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;try{await (0,c.eu)()}catch(e){return et.warn(en.create("indexeddb-unavailable",{errorInfo:null==e?void 0:e.toString()}).message),!1}return!0}async function eb(e,t,n,r,o,s,l){var c;let u=ec(e);u.then(t=>{n[t.measurementId]=t.appId,e.options.measurementId&&t.measurementId!==e.options.measurementId&&et.warn(`The measurement ID in the local Firebase config (${e.options.measurementId}) does not match the measurement ID fetched from the server (${t.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(e=>et.error(e)),t.push(u);let d=ey().then(e=>e?r.getId():void 0),[f,p]=await Promise.all([u,d]);!function(e){let t=window.document.getElementsByTagName("script");for(let n of Object.values(t))if(n.src&&n.src.includes(ee)&&n.src.includes(e))return n;return null}(s)&&function(e,t){let n;let a=(window.trustedTypes&&(n=window.trustedTypes.createPolicy("firebase-js-sdk-policy",{createScriptURL:ea})),n),i=document.createElement("script"),r=`${ee}?l=${e}&id=${t}`;i.src=a?null==a?void 0:a.createScriptURL(r):r,i.async=!0,document.head.appendChild(i)}(s,f.measurementId),i&&(o("consent","default",i),i=void 0),o("js",new Date);let h=null!==(c=null==l?void 0:l.config)&&void 0!==c?c:{};return h.origin="firebase",h.update=!0,null!=p&&(h.firebase_id=p),o("config",f.measurementId,h),a&&(o("set",a),a=void 0),f.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ev{constructor(e){this.app=e}_delete(){return delete eI[this.app.options.appId],Promise.resolve()}}let eI={},eT=[],ek={},eC="dataLayer",eS="gtag",e$=!1;function eA(e){if(e$)throw en.create("already-initialized");e.dataLayerName&&(eC=e.dataLayerName),e.gtagName&&(eS=e.gtagName)}function ej(e=(0,s.Mq)()){e=(0,c.m9)(e);let t=(0,s.qX)(e,Q);return t.isInitialized()?t.getImmediate():eD(e)}function eD(e,t={}){let n=(0,s.qX)(e,Q);if(n.isInitialized()){let e=n.getImmediate();if((0,c.vZ)(t,n.getOptions()))return e;throw en.create("already-initialized")}let a=n.initialize({options:t});return a}async function eP(){if((0,c.ru)()||!(0,c.zI)()||!(0,c.hl)())return!1;try{let e=await (0,c.eu)();return e}catch(e){return!1}}function eq(e,t,n){ep(o,eI[(e=(0,c.m9)(e)).app.options.appId],t,n).catch(e=>et.error(e))}async function eF(e){return em(o,eI[(e=(0,c.m9)(e)).app.options.appId])}function eM(e,t,n){eh(o,eI[(e=(0,c.m9)(e)).app.options.appId],t,n).catch(e=>et.error(e))}function ex(e,t,n){eg(o,eI[(e=(0,c.m9)(e)).app.options.appId],t,n).catch(e=>et.error(e))}function eE(e,t){ew(eI[(e=(0,c.m9)(e)).app.options.appId],t).catch(e=>et.error(e))}function eN(e){o?o("set",e):a=e}function ez(e,t,n,a){ef(o,eI[(e=(0,c.m9)(e)).app.options.appId],t,n,a).catch(e=>et.error(e))}function eO(e){o?o("consent","update",e):i=e}let e_="@firebase/analytics",eL="0.10.11";(0,s.Xd)(new u.wA(Q,(e,{options:t})=>{let n=e.getProvider("app").getImmediate(),a=e.getProvider("installations-internal").getImmediate();return function(e,t,n){!function(){let e=[];if((0,c.ru)()&&e.push("This is a browser extension environment."),(0,c.zI)()||e.push("Cookies are not available."),e.length>0){let t=e.map((e,t)=>`(${t+1}) ${e}`).join(" "),n=en.create("invalid-analytics-context",{errorInfo:t});et.warn(n.message)}}();let a=e.options.appId;if(!a)throw en.create("no-app-id");if(!e.options.apiKey){if(e.options.measurementId)et.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${e.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw en.create("no-api-key")}if(null!=eI[a])throw en.create("already-exists",{id:a});if(!e$){var i,s,l,u;let e,t;i=eC,e=[],Array.isArray(window[i])?e=window[i]:window[i]=e;let{wrappedGtag:n,gtagCore:a}=(s=eC,l=eS,t=function(...e){window[s].push(arguments)},window[l]&&"function"==typeof window[l]&&(t=window[l]),window[l]=(u=t,async function(e,...t){try{if("event"===e){let[e,n]=t;await eo(u,eI,eT,e,n)}else if("config"===e){let[e,n]=t;await er(u,eI,eT,ek,e,n)}else if("consent"===e){let[e,n]=t;u("consent",e,n)}else if("get"===e){let[e,n,a]=t;u("get",e,n,a)}else if("set"===e){let[e]=t;u("set",e)}else u(e,...t)}catch(e){et.error(e)}}),{gtagCore:t,wrappedGtag:window[l]});o=n,r=a,e$=!0}eI[a]=eb(e,eT,ek,t,r,eC,n);let d=new ev(e);return d}(n,a,t)},"PUBLIC")),(0,s.Xd)(new u.wA("analytics-internal",function(e){try{let t=e.getProvider(Q).getImmediate();return{logEvent:(e,n,a)=>ez(t,e,n,a)}}catch(e){throw en.create("interop-component-reg-failed",{reason:e})}},"PRIVATE")),(0,s.KN)(e_,eL),(0,s.KN)(e_,eL,"esm2017")}}]);