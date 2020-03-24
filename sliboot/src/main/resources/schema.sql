CREATE TABLE IF NOT EXISTS `SVC_LOGIC` (
  `module` varchar(80) NOT NULL,
  `rpc` varchar(80) NOT NULL,
  `version` varchar(40) NOT NULL,
  `mode` varchar(5) NOT NULL,
  `active` varchar(1) NOT NULL,
  `graph` longblob,
  `modified_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `md5sum` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`module`,`rpc`,`version`,`mode`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;