#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=crypto-config/ordererOrganizations/companyABC.com/orderers/orderer.companyABC.com/msp/tlscacerts/tlsca.companyABC.com-cert.pem
export PEER0_ORG1_CA=crypto-config/peerOrganizations/org1.companyABC.com/peers/peer0.org1.companyABC.com/tls/ca.crt

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
  export CORE_PEER_LOCALMSPID="OrdererMSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=crypto-config/ordererOrganizations/companyABC.com/orderers/orderer.companyABC.com/msp/tlscacerts/tlsca.companyABC.com-cert.pem
  export CORE_PEER_MSPCONFIGPATH=crypto-config/ordererOrganizations/companyABC.com/users/Admin@companyABC.com/msp
}

# Set environment variables for the peer org
setOrg1Env() {

export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
export CORE_PEER_MSPCONFIGPATH=crypto-config/peerOrganizations/org1.companyABC.com/users/Admin@org1.companyABC.com/msp
export CORE_PEER_ADDRESS=localhost:7051

if [ "$VERBOSE" == "true" ]; then
  env | grep CORE
fi
}

# parsePeerConnectionParameters $@
# Helper function that takes the parameters from a chaincode operation
# (e.g. invoke, query, instantiate) and checks for an even number of
# peers and associated org, then sets $PEER_CONN_PARMS and $PEERS
parsePeerConnectionParameters() {
  # check for uneven number of peer and org parameters

  PEER_CONN_PARMS=""
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setOrg1Env
    PEER="peer0.org$1"
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "true" ]; then
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_ORG$1_CA")
      PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
    fi
    # shift by two to get the next pair of peer/org parameters
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi
}
