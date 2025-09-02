export const BASE_URL = 'https://pid.limspakistan.org/';
let END_POINT = 'api/';


export const API = {

    /**`
     * Backend URL
     * @constant 'BACKEND URL'
     */
 
  loginUser: BASE_URL + END_POINT +'token/',
  verifyToken: BASE_URL + END_POINT +'verify-token/',
  canallist: BASE_URL + END_POINT +'canals/',
  userlist: BASE_URL + END_POINT +'users/',
  region: BASE_URL + END_POINT +'regions/',
  progress: BASE_URL + END_POINT +'canals/desilting-progress/',
  tasks: BASE_URL + END_POINT +'canals/tasks/',
  titles: BASE_URL + END_POINT +'users/titles/',
  phases: BASE_URL + END_POINT +'canals/phases/',
  canals: BASE_URL + END_POINT +'canals/canals/',
  tasksAssignment: BASE_URL + END_POINT +'canals/tasksAssignment/',
  approve: BASE_URL + END_POINT +'canals/approve/',
  rejected: BASE_URL + END_POINT +'canals/disapprove/',
  assigned: BASE_URL + END_POINT +'canals/assignments/',



}

export default API