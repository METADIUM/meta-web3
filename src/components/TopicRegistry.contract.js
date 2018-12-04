import { getAddresses } from '../addresses';
import { getBranch, getABI } from '../helpers';

var _ = require('underscore');

class TopicRegistry {

  async init({web3, netid}) {
    this.addresses = getAddresses(netid);

    const topicRegistryAbi = await getABI(getBranch(netid), 'TopicRegistry');
    this.topicRegistryInstance = new web3.eth.Contract(topicRegistryAbi.abi, this.addresses.TOPIC_REGISTRY_ADDRESS);
  }

  async isRegistered(topicID) {
    // Validate ABI
    if (! this.topicRegistryInstance || ! this.topicRegistryInstance.methods.isRegistered) return;

    // Call
    return this.topicRegistryInstance.methods.isRegistered(topicID).call();
  }

  async getTopic(topicID) {
    // Validate ABI
    if (! this.topicRegistryInstance || ! this.topicRegistryInstance.methods.getTopic) return;

    // Call
    return this.topicRegistryInstance.methods.getTopic(topicID).call();
  }

  async getTotal() {
    // Validate ABI
    if (! this.topicRegistryInstance || ! this.topicRegistryInstance.methods.getTotal) return;

    // Call
    return this.topicRegistryInstance.methods.getTotal().call();
  }

  async getAllTopic({handler, cb}) {
    if (! handler || ! cb) return;

    // Search topics with the range from zero to total
    let total = await this.getTotal();
    Promise.all(_.range(total).map(async (id) => {
      let topicID = id;
      // Execute handler from getTopic() when a topic was registered
      if (await this.isRegistered(topicID)) {
        await this.getTopic(topicID).then(ret => { ret['id'] = topicID; handler(ret); });
      } else handler();
    })).then(() => cb());
  }

  /**
   * 
   * @param {bytes32} title 
   * @param {bytes32} explanation 
   */
  registerTopic(title, explanation) {
    // Validate ABI
    if (! this.topicRegistryInstance || ! this.topicRegistryInstance.methods.registerTopic) return;

    // Return transaction param
    return {
      request: this.topicRegistryInstance.methods.registerTopic(title, explanation).send.request(),
      to: this.addresses.TOPIC_REGISTRY_ADDRESS,
      data: this.topicRegistryInstance.methods.registerTopic(title, explanation).encodeABI(),
    };
  }
}

export {TopicRegistry}